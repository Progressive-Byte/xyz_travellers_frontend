"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { loginUser, registerUser } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

type AuthMode = "login" | "register";
type AuthIntent = "guest" | "host";

type AuthFormProps = {
  mode: AuthMode;
  intent: AuthIntent;
  returnTo?: string;
};

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
};

type FormErrors = Partial<Record<keyof FormValues | "form", string>>;

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  address: "",
};

const Field: React.FC<{
  label: string;
  name: keyof FormValues;
  value: string;
  onChange: (name: keyof FormValues, value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  error?: string;
  required?: boolean;
}> = ({ label, name, value, onChange, type = "text", placeholder, error, required }) => (
  <label className="block">
    <div className="mb-2 flex items-center gap-2">
      <span className="text-[13px] font-semibold text-text-primary">{label}</span>
      {required ? (
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          Required
        </span>
      ) : null}
    </div>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(name, event.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-[22px] border bg-card px-4 py-3.5 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:shadow-medium ${
        error
          ? "border-red-300 focus:border-red-400"
          : "border-border focus:border-text-primary/20"
      }`}
    />
    {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}
  </label>
);

const resolveSafeReturnTo = (value?: string) => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "";
  }

  return trimmed;
};

export const AuthForm: React.FC<AuthFormProps> = ({ mode, intent, returnTo }) => {
  const router = useRouter();
  const { setSession } = useAuth();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isRegisterMode = mode === "register";
  const safeReturnTo = useMemo(() => resolveSafeReturnTo(returnTo), [returnTo]);

  const headerCopy = useMemo(() => {
    if (intent === "host") {
      return isRegisterMode
        ? {
            title: "Create host account",
            description: "Use one account for hosting access.",
            submitLabel: "Create account",
          }
        : {
            title: "Host sign in",
            description: "Continue with your account.",
            submitLabel: "Sign in",
          };
    }

    return isRegisterMode
      ? {
          title: "Create account",
          description: "Set up your account.",
          submitLabel: "Create account",
        }
      : {
          title: "Log in",
          description: "Sign in to continue.",
          submitLabel: "Log in",
        };
  }, [intent, isRegisterMode]);

  const updateValue = (name: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (isRegisterMode) {
      if (!values.firstName.trim()) {
        nextErrors.firstName = "Please enter your first name.";
      }

      if (!values.lastName.trim()) {
        nextErrors.lastName = "Please enter your last name.";
      }
    }

    if (!values.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!values.password) {
      nextErrors.password = "Please enter your password.";
    } else if (isRegisterMode && values.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const session = isRegisterMode
        ? await registerUser({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            phone: values.phone,
            address: values.address,
          })
        : await loginUser({
            email: values.email,
            password: values.password,
          });

      const hasHostAccess = session.user.roles.includes("host");
      const shouldGoToHostArea = intent === "host";
      const hostDestination = hasHostAccess ? "/host/dashboard" : "/host/onboarding";
      const guestDestination = safeReturnTo || "/guest/dashboard";
      const redirectTarget = shouldGoToHostArea ? hostDestination : guestDestination;

      setSession(session);
      setSuccessMessage(
        safeReturnTo
          ? "Login successful. Restoring your previous route. Redirecting..."
          : shouldGoToHostArea && hasHostAccess
          ? "Host access confirmed. Redirecting..."
          : isRegisterMode && intent === "host"
            ? "Account created successfully. Continue your host onboarding. Redirecting..."
            : !isRegisterMode && intent === "host"
              ? "Login successful. Continue your host onboarding. Redirecting..."
            : isRegisterMode
              ? "Account created successfully. Opening your guest portal. Redirecting..."
              : "Login successful. Opening your guest portal. Redirecting...",
      );
      router.push(redirectTarget);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        const message =
          error.status === 401
            ? "We could not log you in with those credentials."
            : error.status === 403
              ? "Your account is currently inactive. Please contact support."
              : error.message;

        setErrors({ form: message || "Something went wrong. Please try again." });
      } else {
        setErrors({ form: "Something went wrong. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildAuthHref = (nextMode: AuthMode) => {
    const params = new URLSearchParams({
      mode: nextMode,
    });

    if (intent === "host") {
      params.set("intent", "host");
    }

    if (safeReturnTo) {
      params.set("returnTo", safeReturnTo);
    }

    return `/auth?${params.toString()}`;
  };

  const switchModeHref = buildAuthHref(isRegisterMode ? "login" : "register");

  return (
    <div className="rounded-[30px] border border-border-light bg-surface p-5 shadow-soft md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={buildAuthHref("login")}
          className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
            !isRegisterMode
              ? "bg-primary text-text-primary shadow-glow"
              : "border border-border bg-card text-text-secondary shadow-soft hover:border-text-primary/15 hover:text-text-primary"
          }`}
        >
          Log in
        </Link>
        <Link
          href={buildAuthHref("register")}
          className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
            isRegisterMode
              ? "bg-primary text-text-primary shadow-glow"
              : "border border-border bg-card text-text-secondary shadow-soft hover:border-text-primary/15 hover:text-text-primary"
          }`}
        >
          Create account
        </Link>
      </div>

      <div className="mt-6">
        <h2 className="font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
          {headerCopy.title}
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-text-secondary">{headerCopy.description}</p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {isRegisterMode ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              name="firstName"
              value={values.firstName}
              onChange={updateValue}
              placeholder="John"
              error={errors.firstName}
              required
            />
            <Field
              label="Last name"
              name="lastName"
              value={values.lastName}
              onChange={updateValue}
              placeholder="Doe"
              error={errors.lastName}
              required
            />
          </div>
        ) : null}

        <Field
          label="Email"
          name="email"
          value={values.email}
          onChange={updateValue}
          type="email"
          placeholder="john@example.com"
          error={errors.email}
          required
        />

        <label className="block">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-text-primary">Password</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                Required
              </span>
            </div>
            {isRegisterMode ? (
              <span className="text-[12px] text-text-secondary">Minimum 8 characters</span>
            ) : null}
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={(event) => updateValue("password", event.target.value)}
              placeholder="Enter your password"
              className={`w-full rounded-[22px] border bg-card px-4 py-3.5 pr-28 text-[15px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:shadow-medium ${
                errors.password
                  ? "border-red-300 focus:border-red-400"
                  : "border-border focus:border-text-primary/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-soft transition-colors duration-200 hover:bg-card"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password ? <p className="mt-2 text-[13px] text-red-600">{errors.password}</p> : null}
        </label>

        {isRegisterMode ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Phone"
              name="phone"
              value={values.phone}
              onChange={updateValue}
              type="tel"
              placeholder="+8801700000000"
              error={errors.phone}
            />
            <Field
              label="Address"
              name="address"
              value={values.address}
              onChange={updateValue}
              placeholder="Dhaka, Bangladesh"
              error={errors.address}
            />
          </div>
        ) : null}

        {errors.form ? (
          <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
            {errors.form}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-[22px] border border-primary/35 bg-primary-light px-4 py-3 text-[14px] text-text-primary">
            {successMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover disabled:translate-y-0 disabled:opacity-60"
        >
          {isSubmitting ? "Please wait..." : headerCopy.submitLabel}
        </button>
      </form>

      <div className="mt-4 text-[14px] leading-6 text-text-secondary">
        {isRegisterMode ? (
          <>
            Already have an account?{" "}
            <Link href={switchModeHref} className="font-semibold text-text-primary">
              Log in here
            </Link>
            .
          </>
        ) : (
          <>
            Need an account first?{" "}
            <Link href={switchModeHref} className="font-semibold text-text-primary">
              Create one here
            </Link>
            .
          </>
        )}
      </div>
    </div>
  );
};
