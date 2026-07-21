"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { buildGuestBookingCreateHref } from "@/lib/guest";

type PropertyBookingUnitOption = {
  id: string;
  label: string;
  capacity: number | null;
  nightlyLabel: string;
  stayTotalLabel: string;
};

type PropertyBookingCardProps = {
  propertyId: string;
  priceLabel: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number | null;
  initialUnitId?: string;
  units: PropertyBookingUnitOption[];
  guestPlaceholder?: string;
  availabilityLabel?: string;
  stayTotalLabel?: string;
};

const FieldLabel: React.FC<{
  label: string;
}> = ({ label }) => (
  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
    {label}
  </p>
);

type DateInputButtonProps = {
  value?: string;
  onClick?: () => void;
  label: string;
};

const DateInputButton = React.forwardRef<HTMLButtonElement, DateInputButtonProps>(
  ({ value, onClick, label }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="w-full text-left outline-none focus:outline-none focus-visible:outline-none"
    >
      <span className="block text-[14px] font-semibold text-text-primary">{value || label}</span>
    </button>
  ),
);

DateInputButton.displayName = "DateInputButton";

const FieldShell: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="rounded-[20px] border border-border bg-card px-4 py-3 shadow-soft">
    <FieldLabel label={label} />
    <div className="mt-1">{children}</div>
  </div>
);

const bookingDatePickerClassName =
  "z-[70] mt-3 [&_.react-datepicker]:rounded-[24px] [&_.react-datepicker]:border [&_.react-datepicker]:border-border [&_.react-datepicker]:bg-white/95 [&_.react-datepicker]:shadow-strong [&_.react-datepicker]:backdrop-blur-xl [&_.react-datepicker__header]:rounded-t-[24px] [&_.react-datepicker__header]:border-border [&_.react-datepicker__header]:bg-surface [&_.react-datepicker__current-month]:text-[14px] [&_.react-datepicker__current-month]:font-semibold [&_.react-datepicker__day-name]:text-[11px] [&_.react-datepicker__day-name]:font-semibold [&_.react-datepicker__day--selected]:bg-primary [&_.react-datepicker__day--keyboard-selected]:bg-primary/70";

const parseDateValue = (value?: string) => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  const parts = normalized.split("-");

  if (parts.length === 3) {
    const [yearValue, monthValue, dayValue] = parts;
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);

    if (
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      Number.isInteger(day) &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
    ) {
      const parsed = new Date(year, month - 1, day);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateValue = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateLabel = (value: Date | null) => {
  if (!value) {
    return "";
  }

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const PropertyBookingCard: React.FC<PropertyBookingCardProps> = ({
  propertyId,
  priceLabel,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  initialUnitId,
  units,
  guestPlaceholder = "Enter guests",
  availabilityLabel,
  stayTotalLabel,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [checkInDate, setCheckInDate] = useState<Date | null>(parseDateValue(initialCheckIn));
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(parseDateValue(initialCheckOut));
  const [guests, setGuests] = useState<string>(
    initialGuests && initialGuests > 0 ? String(initialGuests) : "",
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    initialUnitId && units.some((unit) => unit.id === initialUnitId)
      ? initialUnitId
      : units.length === 1
        ? units[0]?.id || ""
        : "",
  );
  const [error, setError] = useState("");
  const selectedUnit = useMemo(
    () => units.find((unit) => unit.id === selectedUnitId) ?? null,
    [selectedUnitId, units],
  );

  useEffect(() => {
    const hasSelectedUnit = selectedUnitId && units.some((unit) => unit.id === selectedUnitId);

    if (hasSelectedUnit) {
      return;
    }

    const nextSelectedUnitId =
      initialUnitId && units.some((unit) => unit.id === initialUnitId)
        ? initialUnitId
        : units.length === 1
          ? units[0]?.id || ""
          : "";

    setSelectedUnitId(nextSelectedUnitId);
  }, [initialUnitId, selectedUnitId, units]);

  return (
    <aside className="relative z-20 surface-card-strong rounded-[30px] p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            From
          </p>
          <p className="mt-2 font-sora text-[34px] font-bold tracking-[-0.04em] text-text-primary">
            {priceLabel}
          </p>
        </div>
        <p className="pb-1 text-[14px] font-medium text-text-secondary">best available rate</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <FieldShell label="Check in">
          <DatePicker
            selected={checkInDate}
            onChange={(date: Date | null) => {
              setCheckInDate(date);

              if (date && checkOutDate && checkOutDate <= date) {
                setCheckOutDate(null);
              }

              setError("");
            }}
            selectsStart
            startDate={checkInDate}
            endDate={checkOutDate}
            minDate={new Date()}
            placeholderText="Select date"
            popperPlacement="bottom-start"
            popperClassName={bookingDatePickerClassName}
            showPopperArrow={false}
            wrapperClassName="block"
            customInput={<DateInputButton label="Select date" />}
            value={formatDateLabel(checkInDate)}
          />
        </FieldShell>

        <FieldShell label="Check out">
          <DatePicker
            selected={checkOutDate}
            onChange={(date: Date | null) => {
              setCheckOutDate(date);
              setError("");
            }}
            selectsEnd
            startDate={checkInDate}
            endDate={checkOutDate}
            minDate={checkInDate || new Date()}
            placeholderText="Select date"
            popperPlacement="bottom-start"
            popperClassName={bookingDatePickerClassName}
            showPopperArrow={false}
            wrapperClassName="block"
            customInput={<DateInputButton label="Select date" />}
            value={formatDateLabel(checkOutDate)}
          />
        </FieldShell>

        <FieldShell label="Guests">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={guests}
            onChange={(event) => {
              const nextValue = event.target.value.replace(/[^\d]/g, "");
              setGuests(nextValue);
              setError("");
            }}
            placeholder={guestPlaceholder}
            className="w-full bg-transparent text-[14px] font-semibold text-text-primary outline-none placeholder:font-semibold placeholder:text-text-secondary"
          />
        </FieldShell>

        <FieldShell label="Unit">
          <select
            value={selectedUnitId}
            onChange={(event) => {
              setSelectedUnitId(event.target.value);
              setError("");
            }}
            className="w-full bg-transparent text-[14px] font-semibold text-text-primary outline-none"
          >
            <option value="">Select a unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label}
              </option>
            ))}
          </select>
        </FieldShell>
      </div>

      {error ? (
        <p className="mt-3 text-[13px] font-medium text-[var(--color-danger,#b42318)]">{error}</p>
      ) : null}

      <div className="mt-3 rounded-[22px] border border-border bg-surface px-4 py-3">
        <FieldLabel label="Notes" />
        <p className="mt-1 text-[14px] leading-6 text-text-secondary">
          {availabilityLabel ||
            "Add stay dates to see the best matching unit price and availability for this stay."}
        </p>
      </div>

      {stayTotalLabel ? (
        <div className="mt-3 rounded-[22px] border border-border-light bg-[rgba(245,243,237,0.66)] px-4 py-4">
          <div className="flex items-center justify-between gap-3 text-[14px]">
            <span className="text-text-secondary">Estimated stay total</span>
            <span className="font-semibold text-text-primary">{stayTotalLabel}</span>
          </div>
        </div>
      ) : null}

      {selectedUnit ? (
        <div className="mt-3 rounded-[22px] border border-border-light bg-[rgba(245,243,237,0.66)] px-4 py-4">
          <div className="flex items-center justify-between gap-3 text-[14px]">
            <span className="text-text-secondary">Selected unit</span>
            <span className="font-semibold text-text-primary">{selectedUnit.label}</span>
          </div>
          {selectedUnit.stayTotalLabel ? (
            <div className="mt-3 flex items-center justify-between gap-3 text-[14px]">
              <span className="text-text-secondary">Unit stay total</span>
              <span className="font-semibold text-text-primary">{selectedUnit.stayTotalLabel}</span>
            </div>
          ) : selectedUnit.nightlyLabel ? (
            <div className="mt-3 flex items-center justify-between gap-3 text-[14px]">
              <span className="text-text-secondary">Unit nightly rate</span>
              <span className="font-semibold text-text-primary">{selectedUnit.nightlyLabel}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          const params = new URLSearchParams();

          if ((checkInDate && !checkOutDate) || (!checkInDate && checkOutDate)) {
            setError("Select both check-in and check-out dates.");
            return;
          }

          if (checkInDate && checkOutDate && checkOutDate <= checkInDate) {
            setError("Check-out must be later than check-in.");
            return;
          }

          const guestCount = Number(guests);

          if (guests.trim() && (!Number.isFinite(guestCount) || guestCount < 1)) {
            setError("Guests must be at least 1.");
            return;
          }

          setError("");

          if (checkInDate && checkOutDate) {
            params.set("checkIn", formatDateValue(checkInDate));
            params.set("checkOut", formatDateValue(checkOutDate));
          }

          if (guests.trim()) {
            params.set("guests", String(Math.floor(guestCount)));
          }

          if (selectedUnitId && units.some((unit) => unit.id === selectedUnitId)) {
            params.set("unitId", selectedUnitId);
          }

          const query = params.toString();
          const nextPath = `/properties/${propertyId}`;
          const nextUrl = query ? `${nextPath}?${query}` : nextPath;
          const currentQuery = searchParams.toString();
          const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;

          startTransition(() => {
            if (currentUrl === nextUrl) {
              router.refresh();
              return;
            }

            router.push(nextUrl);
          });
        }}
        disabled={isPending}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3.5 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Checking..." : "Check availability"}
      </button>

      <button
        type="button"
        onClick={() => {
          if (!selectedUnitId || !units.some((unit) => unit.id === selectedUnitId)) {
            setError("Choose a unit before continuing.");
            return;
          }

          if (!checkInDate || !checkOutDate) {
            setError("Select both check-in and check-out dates.");
            return;
          }

          if (checkOutDate <= checkInDate) {
            setError("Check-out must be later than check-in.");
            return;
          }

          const guestCount = Number(guests);

          if (!guests.trim() || !Number.isFinite(guestCount) || guestCount < 1) {
            setError("Enter at least 1 guest before continuing.");
            return;
          }

          if (selectedUnit?.capacity && guestCount > selectedUnit.capacity) {
            setError(`This unit supports up to ${selectedUnit.capacity} guests.`);
            return;
          }

          setError("");
          router.push(
            buildGuestBookingCreateHref({
              propertyId,
              unitId: selectedUnitId,
              checkIn: formatDateValue(checkInDate),
              checkOut: formatDateValue(checkOutDate),
              guests: Math.floor(guestCount),
            }),
          );
        }}
        className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-border bg-white px-5 py-3.5 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
      >
        Continue to booking
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
