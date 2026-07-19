"use client";

import React from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

type HostOnboardingShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
};

export const HostOnboardingShell: React.FC<HostOnboardingShellProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="section-shell py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="surface-card-strong rounded-panel p-6 md:p-8">
            <span className="section-badge">Host Onboarding</span>
            <h1 className="mt-5 font-sora text-[34px] font-bold tracking-[-0.05em] text-text-primary md:text-[46px]">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-text-secondary">{subtitle}</p>
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
