"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const hasStartedRef = useRef(false);

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

  useEffect(() => {
    if (!token || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    void handleCreateDraft();
  }, [token]);

  return (
    <HostShell badge="Add Property">
      <div className="surface-card mx-auto max-w-2xl rounded-panel p-6 md:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Preparing form
        </p>
        <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
          Opening the property editor
        </h2>
        <p className="mt-4 text-[14px] leading-7 text-text-secondary">
          A new property draft is being prepared and you will be redirected straight into the form.
        </p>

        {error ? (
          <div className="mt-5 rounded-[22px] border border-red-200 bg-red-50/80 px-4 py-4 text-[14px] leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {error ? (
            <button
              type="button"
              onClick={() => void handleCreateDraft()}
              disabled={isCreating}
              className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:opacity-70"
            >
              {isCreating ? "Trying again..." : "Try again"}
            </button>
          ) : (
            <div className="inline-flex items-center rounded-[18px] border border-border-light bg-white px-4 py-3 text-[14px] text-text-secondary">
              {isCreating ? "Creating draft..." : "Redirecting..."}
            </div>
          )}
        </div>
      </div>
    </HostShell>
  );
};
