"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HostShell } from "@/components/host/HostShell";
import { HostProfileForm } from "@/components/host/profile/HostProfileForm";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createEmptyHostProfile,
  getHostProfile,
  getHostProfileSetupStatus,
  updateHostProfile,
  type HostProfile,
} from "@/lib/host";

type ProfileFormErrors = Partial<
  Record<keyof Pick<HostProfile, "firstName" | "lastName" | "phone" | "address" | "profilePhoto" | "bio"> | "form", string>
>;

const ProfileSkeleton = () => (
  <HostShell badge="Setup">
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.8fr]">
      <div className="surface-card rounded-panel h-[520px] animate-pulse bg-white/75" />
      <div className="space-y-6">
        <div className="surface-card rounded-panel h-52 animate-pulse bg-white/75" />
        <div className="surface-card rounded-panel h-56 animate-pulse bg-white/75" />
      </div>
    </div>
  </HostShell>
);

export const HostProfilePage: React.FC = () => {
  const { token, user, setSession } = useAuth();
  const [values, setValues] = useState<HostProfile>(createEmptyHostProfile());
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setErrors({});
      setSuccessMessage("");

      try {
        const profile = await getHostProfile(token);

        if (!isActive) {
          return;
        }

        setValues(profile);
      } catch (error) {
        if (!isActive) {
          return;
        }

        const fallbackProfile = createEmptyHostProfile();

        if (user) {
          fallbackProfile.firstName = user.firstName ?? "";
          fallbackProfile.lastName = user.lastName ?? "";
          fallbackProfile.email = user.email ?? "";
          fallbackProfile.phone = user.phone ?? "";
          fallbackProfile.address = user.address ?? "";
          fallbackProfile.profilePhoto = user.profilePhoto ?? "";
          fallbackProfile.bio = user.bio ?? "";
        }

        setValues(fallbackProfile);
        setErrors({
          form:
            error instanceof ApiError
              ? error.message || "We couldn't load your host profile right now."
              : "We couldn't load your host profile right now.",
        });
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [retryKey, token, user]);

  const setupStatus = useMemo(() => getHostProfileSetupStatus(values), [values]);

  const updateValue = (field: keyof HostProfile, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setSuccessMessage("");
  };

  const validate = () => {
    const nextErrors: ProfileFormErrors = {};

    if (!values.firstName.trim()) {
      nextErrors.firstName = "Please enter your first name.";
    }

    if (!values.lastName.trim()) {
      nextErrors.lastName = "Please enter your last name.";
    }

    if (values.profilePhoto.trim() && !/^https?:\/\//i.test(values.profilePhoto.trim())) {
      nextErrors.profilePhoto = "Please enter a valid image URL that starts with http or https.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

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
      const profile = await updateHostProfile(token, {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        address: values.address,
        profilePhoto: values.profilePhoto,
        bio: values.bio,
      });

      setValues((current) => ({
        ...current,
        ...profile,
        email: profile.email || current.email,
      }));
      setSuccessMessage("Profile updated successfully.");

      if (user) {
        setSession({
          token,
          user: {
            ...user,
            firstName: profile.firstName || user.firstName,
            lastName: profile.lastName || user.lastName,
            email: profile.email || user.email,
            phone: profile.phone || undefined,
            address: profile.address || undefined,
            profilePhoto: profile.profilePhoto || undefined,
            bio: profile.bio || undefined,
          },
        });
      }
    } catch (error) {
      setErrors({
        form:
          error instanceof ApiError
            ? error.message || "We couldn't save your host profile right now."
            : "We couldn't save your host profile right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <HostShell
      badge="Setup"
      headerAside={
        <div className="rounded-[24px] border border-border-light bg-card px-5 py-4 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Profile readiness
          </p>
          <p className="mt-3 text-[17px] font-semibold text-text-primary">
            {setupStatus.isComplete ? "Ready to host" : `${setupStatus.missingFields.length} updates left`}
          </p>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.8fr]">
        <HostProfileForm
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          successMessage={successMessage}
          onChange={updateValue}
          onSubmit={handleSubmit}
        />

        <div className="space-y-6">
          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Why this matters
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Keep your host identity polished
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Guests and later listing flows rely on clear host identity details.",
                "A short bio helps your profile feel complete and trustworthy.",
                "Contact and address data help later setup steps stay consistent.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-border-light bg-white/80 px-4 py-3 text-[14px] leading-6 text-text-primary"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {!setupStatus.isComplete ? (
            <div className="surface-card rounded-panel p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Still missing
              </p>
              <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
                Finish the essentials
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-text-secondary">
                Add the remaining profile details so the dashboard can stop prompting you here.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {setupStatus.missingFields.map((field) => (
                  <span
                    key={field}
                    className="rounded-full border border-border-light bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-text-primary"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Retry
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Refresh host profile
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-text-secondary">
              If another device or admin action updated your profile, reload the host profile data here.
            </p>
            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-5 inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-4 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
            >
              Reload profile
            </button>
          </div>
        </div>
      </div>
    </HostShell>
  );
};
