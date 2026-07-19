"use client";

import React from "react";
import { HostPropertyStatusPill } from "@/components/host/properties/HostPropertyStatusPill";
import { hostPropertyEditorSteps } from "@/components/host/properties/hostPropertyEditor";
import { type HostPropertyStatus } from "@/lib/host";

type HostPropertyEditorShellProps = {
  title: string;
  status: HostPropertyStatus;
  children: React.ReactNode;
  headerAside?: React.ReactNode;
};

const stepStateClasses = {
  active: "border-primary/35 bg-primary-light/80",
  available: "border-border-light bg-card",
  upcoming: "border-border-light bg-white/75 opacity-80",
};

export const HostPropertyEditorShell: React.FC<HostPropertyEditorShellProps> = ({
  title,
  status,
  children,
  headerAside,
}) => {
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
              This editor starts the add-property flow with basics and location. Later media, units,
              pricing, and verification steps can plug into the same structure next.
            </p>
          </div>

          {headerAside ? <div className="lg:max-w-sm">{headerAside}</div> : null}
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-3">
          {hostPropertyEditorSteps.map((step) => (
            <div
              key={step.key}
              className={`rounded-[22px] border px-4 py-4 ${stepStateClasses[step.state]}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                {step.state === "upcoming" ? "Upcoming" : step.state === "available" ? "Open now" : "Current"}
              </p>
              <h3 className="mt-3 text-[16px] font-semibold text-text-primary">{step.label}</h3>
              <p className="mt-2 text-[13px] leading-6 text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
};
