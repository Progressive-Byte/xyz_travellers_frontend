"use client";

import React, { useEffect, useState } from "react";
import { GuestShell } from "@/components/guest/GuestShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  getGuestProfile,
  updateGuestProfile,
  type GuestProfile,
  type UpdateGuestProfilePayload,
} from "@/lib/guest";

const inputClassName =
  "w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium";

const emptyProfilePayload: UpdateGuestProfilePayload = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  profilePhoto: "",
  preferredLanguage: "",
  preferredCurrency: "",
  dateOfBirth: "",
  nationality: "",
  bio: "",
};

export const GuestProfilePage: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [formState, setFormState] = useState<UpdateGuestProfilePayload>(emptyProfilePayload);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getGuestProfile(token);

        if (!isActive) {
          return;
        }

        setProfile(result);
        setFormState({
          firstName: result.firstName,
          lastName: result.lastName,
          phone: result.phone,
          address: result.address,
          profilePhoto: result.profilePhoto,
          preferredLanguage: result.preferredLanguage,
          preferredCurrency: result.preferredCurrency,
          dateOfBirth: result.dateOfBirth,
          nationality: result.nationality,
          bio: result.bio,
        });
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your profile right now."
            : "We couldn't load your profile right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  return (
    <GuestShell badge="Account">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="surface-card rounded-panel p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Profile settings
            </p>
            <h1 className="mt-2 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
              Update your guest account details
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">
              Keep your personal info, travel preferences, and guest-facing profile ready for upcoming stays.
            </p>
          </div>

          {error ? (
            <div className="mt-5 rounded-[20px] border border-[var(--color-danger,#b42318)]/15 bg-[rgba(180,35,24,0.04)] px-4 py-3 text-[14px] text-[var(--color-danger,#b42318)]">
              {error}
            </div>
          ) : null}
          {successMessage ? (
            <div className="mt-5 rounded-[20px] border border-[rgba(64,145,108,0.16)] bg-[rgba(64,145,108,0.08)] px-4 py-3 text-[14px] text-[rgb(35,92,69)]">
              {successMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-[22px] bg-white/75" />
              ))}
            </div>
          ) : (
            <form
              className="mt-6 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();

                if (!token) {
                  return;
                }

                setIsSaving(true);
                setError("");
                setSuccessMessage("");

                try {
                  const result = await updateGuestProfile(token, formState);
                  setProfile(result);
                  setFormState({
                    firstName: result.firstName,
                    lastName: result.lastName,
                    phone: result.phone,
                    address: result.address,
                    profilePhoto: result.profilePhoto,
                    preferredLanguage: result.preferredLanguage,
                    preferredCurrency: result.preferredCurrency,
                    dateOfBirth: result.dateOfBirth,
                    nationality: result.nationality,
                    bio: result.bio,
                  });
                  setSuccessMessage("Profile updated successfully.");
                } catch (requestError) {
                  setError(
                    requestError instanceof ApiError
                      ? requestError.message || "Unable to save your profile right now."
                      : "Unable to save your profile right now.",
                  );
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    First name
                  </span>
                  <input
                    type="text"
                    value={formState.firstName}
                    onChange={(event) => setFormState((current) => ({ ...current, firstName: event.target.value }))}
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Last name
                  </span>
                  <input
                    type="text"
                    value={formState.lastName}
                    onChange={(event) => setFormState((current) => ({ ...current, lastName: event.target.value }))}
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Phone
                  </span>
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))}
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Nationality
                  </span>
                  <input
                    type="text"
                    value={formState.nationality}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, nationality: event.target.value }))
                    }
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Preferred language
                  </span>
                  <input
                    type="text"
                    value={formState.preferredLanguage}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, preferredLanguage: event.target.value }))
                    }
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Preferred currency
                  </span>
                  <input
                    type="text"
                    value={formState.preferredCurrency}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, preferredCurrency: event.target.value }))
                    }
                    className={inputClassName}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Address
                  </span>
                  <input
                    type="text"
                    value={formState.address}
                    onChange={(event) => setFormState((current) => ({ ...current, address: event.target.value }))}
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Date of birth
                  </span>
                  <input
                    type="date"
                    value={formState.dateOfBirth}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, dateOfBirth: event.target.value }))
                    }
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Profile photo URL
                  </span>
                  <input
                    type="url"
                    value={formState.profilePhoto}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, profilePhoto: event.target.value }))
                    }
                    className={inputClassName}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Bio
                  </span>
                  <textarea
                    rows={5}
                    value={formState.bio}
                    onChange={(event) => setFormState((current) => ({ ...current, bio: event.target.value }))}
                    className={inputClassName}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save profile"}
                </button>
                <button
                  type="button"
                  onClick={() => setRetryKey((current) => current + 1)}
                  className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                >
                  Reload
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="surface-card rounded-panel p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Account snapshot
          </p>

          <div className="mt-4 space-y-3">
            <div className="rounded-[18px] border border-border bg-card px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Email
              </p>
              <p className="mt-2 break-all text-[14px] font-semibold text-text-primary">
                {profile?.email || "Not available"}
              </p>
            </div>
            <div className="rounded-[18px] border border-border bg-card px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Roles
              </p>
              <p className="mt-2 text-[14px] font-semibold capitalize text-text-primary">
                {profile?.roles.join(", ") || "guest"}
              </p>
            </div>
            <div className="rounded-[18px] border border-border bg-card px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Profile status
              </p>
              <p className="mt-2 text-[14px] text-text-secondary">
                Keep these details current so booking, messaging, and support flows stay smoother.
              </p>
            </div>
          </div>
        </section>
      </div>
    </GuestShell>
  );
};
