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
  active: {
    shell: "border-primary/35 bg-primary-light/80 shadow-soft",
    badge: "border-primary/35 bg-primary text-text-primary",
    line: "bg-primary/70",
  },
  available: {
    shell: "border-border-light bg-card hover:border-primary/25 hover:bg-white hover:shadow-soft",
    badge: "border-primary/20 bg-white text-text-primary",
    line: "bg-primary/25",
  },
  upcoming: {
    shell: "border-border-light bg-white/75",
    badge: "border-border-light bg-surface text-text-secondary",
    line: "bg-border-light",
  },
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
  const currentStepNumber = steps.findIndex((step) => step.key === currentStep) + 1;

  return (
    <div className="space-y-6">
      <div className="surface-card rounded-panel p-5 md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Property setup wizard
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="font-sora text-[26px] font-bold tracking-[-0.04em] text-text-primary">
                {title}
              </h2>
              <HostPropertyStatusPill status={status} />
            </div>
            <p className="mt-3 max-w-3xl text-[13px] leading-6 text-text-secondary">
              {description ||
                "This workflow now carries the listing through basics, location, media, units, pricing, calendar, and final verification before submission."}
            </p>
          </div>

          {headerAside ? <div className="lg:max-w-sm">{headerAside}</div> : null}
        </div>

        <div className="mt-5 rounded-[24px] border border-border-light bg-white/70 p-3 md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Setup progress
            </p>
            <div className="rounded-full border border-border-light bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
              Step {currentStepNumber} of {steps.length}
            </div>
          </div>

          <div className="mt-4 hidden xl:flex xl:items-center xl:gap-2 xl:overflow-x-auto xl:pb-1">
            {steps.map((step, index) => {
              const stateClasses = stepStateClasses[step.state];
              const stepContent = (
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold ${stateClasses.badge}`}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[14px] font-semibold text-text-primary">{step.label}</h4>
                  </div>
                </div>
              );

              return (
                <div key={step.key} className="flex min-w-[170px] flex-1 items-center gap-2">
                  {step.href ? (
                    <Link
                      href={step.href}
                      className={`group flex-1 rounded-[18px] border px-3 py-3 transition-all duration-200 ${stateClasses.shell}`}
                    >
                      {stepContent}
                    </Link>
                  ) : (
                    <div
                      className={`group flex-1 rounded-[18px] border px-3 py-3 transition-all duration-200 ${stateClasses.shell}`}
                    >
                      {stepContent}
                    </div>
                  )}

                  {index < steps.length - 1 ? (
                    <div className="flex w-4 shrink-0 justify-center">
                      <div className={`h-px w-full ${stateClasses.line}`} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-4 space-y-2 xl:hidden">
            {steps.map((step, index) => {
              const stateClasses = stepStateClasses[step.state];
              const stepContent = (
                <>
                  <h4 className="text-[15px] font-semibold text-text-primary">{step.label}</h4>
                </>
              );

              return (
                <div key={step.key} className="flex gap-3">
                  <div className="flex w-9 flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-semibold ${stateClasses.badge}`}
                    >
                      {index + 1}
                    </div>
                    {index < steps.length - 1 ? (
                      <div className={`mt-1 h-full w-px ${stateClasses.line}`} />
                    ) : null}
                  </div>

                  {step.href ? (
                    <Link
                      href={step.href}
                      className={`flex-1 rounded-[18px] border px-3 py-3 transition-all duration-200 ${stateClasses.shell}`}
                    >
                      {stepContent}
                    </Link>
                  ) : (
                    <div
                      className={`flex-1 rounded-[18px] border px-3 py-3 transition-all duration-200 ${stateClasses.shell}`}
                    >
                      {stepContent}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};
