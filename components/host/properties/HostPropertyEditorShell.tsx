"use client";

import Link from "next/link";
import React from "react";
import { HostPropertyStatusPill } from "@/components/host/properties/HostPropertyStatusPill";
import {
  getHostPropertyEditorSteps,
  type HostPropertyEditorStep,
  type HostPropertyEditorStepKey,
} from "@/components/host/properties/hostPropertyEditor";
import { type HostPropertyStatus } from "@/lib/host";

type HostPropertyEditorShellProps = {
  propertyId: string;
  currentStep: HostPropertyEditorStepKey;
  title: string;
  status: HostPropertyStatus;
  children: React.ReactNode;
  headerAside?: React.ReactNode;
  description?: string;
};

const stepStateClasses = {
  active: "border-primary/35 bg-primary-light/80",
  available: "border-border-light bg-card",
  upcoming: "border-border-light bg-white/75",
};

export const HostPropertyEditorShell: React.FC<HostPropertyEditorShellProps> = ({
  propertyId,
  currentStep,
  title,
  status,
  children,
  headerAside,
  description,
}) => {
  const steps = getHostPropertyEditorSteps(propertyId, currentStep);
  const getStepLabel = (state: HostPropertyEditorStep["state"], isLinked: boolean) => {
    if (state === "active") {
      return "Current";
    }

    if (state === "available") {
      return "Open now";
    }

    return isLinked ? "Open stage" : "Upcoming";
  };

  return (
    <div className="space-y-6">
      <div className="surface-card rounded-panel p-6 md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Draft listing
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="font-sora text-[30px] font-bold tracking-[-0.04em] text-text-primary">
                {title}
              </h2>
              <HostPropertyStatusPill status={status} />
            </div>
            <p className="mt-4 max-w-3xl text-[14px] leading-7 text-text-secondary">
              {description ||
                "This workflow now carries the listing through basics, location, media, units, pricing, calendar, and final verification before submission."}
            </p>
          </div>

          {headerAside ? <div className="lg:max-w-sm">{headerAside}</div> : null}
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-3">
          {steps.map((step) =>
            step.href ? (
              <Link
              key={step.key}
                href={step.href}
                className={`rounded-[22px] border px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft ${stepStateClasses[step.state]}`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  {getStepLabel(step.state, true)}
                </p>
                <h3 className="mt-3 text-[16px] font-semibold text-text-primary">{step.label}</h3>
                <p className="mt-2 text-[13px] leading-6 text-text-secondary">{step.description}</p>
              </Link>
            ) : (
              <div
                key={step.key}
                className={`rounded-[22px] border px-4 py-4 ${stepStateClasses[step.state]}`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  {getStepLabel(step.state, false)}
                </p>
                <h3 className="mt-3 text-[16px] font-semibold text-text-primary">{step.label}</h3>
                <p className="mt-2 text-[13px] leading-6 text-text-secondary">{step.description}</p>
              </div>
            ),
          )}
        </div>
      </div>

      {children}
    </div>
  );
};
