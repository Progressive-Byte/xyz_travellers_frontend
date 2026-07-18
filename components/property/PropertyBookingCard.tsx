import React from "react";

type PropertyBookingCardProps = {
  pricePerNight: number;
  guestCount: number;
};

const FieldShell: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="rounded-[20px] border border-border bg-card px-4 py-3 shadow-soft">
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
      {label}
    </p>
    <p className="mt-1 text-[14px] font-semibold text-text-primary">{value}</p>
  </div>
);

export const PropertyBookingCard: React.FC<PropertyBookingCardProps> = ({
  pricePerNight,
  guestCount,
}) => {
  return (
    <aside className="surface-card-strong rounded-[30px] p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            From
          </p>
          <p className="mt-2 font-sora text-[34px] font-bold tracking-[-0.04em] text-text-primary">
            BDT {pricePerNight.toLocaleString()}
          </p>
        </div>
        <p className="pb-1 text-[14px] font-medium text-text-secondary">per night</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <FieldShell label="Check in" value="Select date" />
        <FieldShell label="Check out" value="Select date" />
        <FieldShell
          label="Guests"
          value={`Up to ${guestCount} guest${guestCount > 1 ? "s" : ""}`}
        />
      </div>

      <div className="mt-3 rounded-[22px] border border-border bg-surface px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
          Notes
        </p>
        <p className="mt-1 text-[14px] leading-6 text-text-secondary">
          Add stay dates, special requests, or arrival notes before sending your booking request.
        </p>
      </div>

      <button
        type="button"
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3.5 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
      >
        Send booking request
      </button>

      <div className="mt-5 rounded-[22px] border border-border-light bg-[rgba(245,243,237,0.66)] px-4 py-4">
        <div className="flex items-center justify-between gap-3 text-[14px]">
          <span className="text-text-secondary">Secure booking support</span>
          <span className="font-semibold text-text-primary">24/7</span>
        </div>
        <div className="mt-3 h-px bg-border-light" />
        <div className="mt-3 flex items-center justify-between gap-3 text-[14px]">
          <span className="text-text-secondary">Flexible stay guidance</span>
          <span className="font-semibold text-text-primary">Included</span>
        </div>
      </div>
    </aside>
  );
};
