"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HostShell } from "@/components/host/HostShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { createHostPropertyDraft } from "@/lib/host";

export const HostPropertyStartPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDraft = async () => {
    if (!token || isCreating) {
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const property = await createHostPropertyDraft(token);

      if (!property.id) {
        throw new ApiError("We couldn't prepare a property draft right now.", 500);
      }

      router.push(`/host/properties/${property.id}/edit`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message || "We couldn't create your property draft right now."
          : "We couldn't create your property draft right now.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <HostShell badge="Add Property">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.85fr]">
        <div className="surface-card rounded-panel p-6 md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Start the workflow
          </p>
          <h2 className="mt-3 font-sora text-[32px] font-bold tracking-[-0.04em] text-text-primary">
            Create a new listing draft
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-text-secondary">
            This first step prepares a real draft property record so you can move into basics and
            location right away. The same listing then continues through media, units, pricing,
            calendar, and verification in the full editor path.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Create a draft property safely before filling everything in.",
              "Continue immediately into the editable basics and location steps.",
              "Return later to the same draft from the properties list.",
              "Use rejected listings as editable recovery paths when needed.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[20px] border border-border-light bg-white/80 px-4 py-4 text-[14px] leading-6 text-text-primary"
              >
                {item}
              </div>
            ))}
          </div>

          {error ? (
            <div className="mt-5 rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCreateDraft}
              disabled={isCreating}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
            >
              {isCreating ? "Creating draft..." : "Create draft property"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              First active steps
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Basics and location
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Property name, description, type, and ownership.",
                "Amenities for the draft foundation.",
                "Address, city, country, map points, and house rules.",
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

          <div className="surface-card rounded-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Full workflow
            </p>
            <h2 className="mt-3 font-sora text-[24px] font-bold tracking-[-0.04em] text-text-primary">
              Keep the next stages in view
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Media and cover image turn the draft into a guest-facing listing.",
                "Units, pricing, and calendar make the property operationally ready.",
                "Verification and review checklist prepare the listing for submission.",
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
        </div>
      </div>
    </HostShell>
  );
};
