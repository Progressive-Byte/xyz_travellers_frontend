"use client";

import Link from "next/link";
import React from "react";
import { type HostReservation } from "@/lib/host";
import {
  formatHostCurrency,
  formatHostDate,
  getGuestCountLabel,
  getReservationStatusClasses,
  getReservationStatusLabel,
} from "@/components/host/operations/hostOperations";

type HostReservationCardProps = {
  reservation: HostReservation;
};

export const HostReservationCard: React.FC<HostReservationCardProps> = ({ reservation }) => {
  const currency = reservation.pricingSnapshot.currency || "BDT";
  const subtotal = reservation.pricingSnapshot.subtotal;

  return (
    <Link
      href={`/host/reservations/${reservation.id}`}
      className="group block rounded-[24px] border border-border-light bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/15 hover:shadow-medium"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[16px] font-semibold text-text-primary">
              {reservation.propertyName || "Property pending"}
            </p>
            <span
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${getReservationStatusClasses(reservation.status)}`}
            >
              {getReservationStatusLabel(reservation.status)}
            </span>
          </div>
          <p className="mt-2 text-[14px] text-text-secondary">
            {reservation.unitName || "Unit pending"} · {reservation.guestName || "Guest pending"}
          </p>
          <p className="mt-1 text-[13px] text-text-secondary">
            Reservation #{reservation.id.slice(-6).toUpperCase()}
          </p>
        </div>

        <div className="grid gap-2 text-left lg:min-w-[180px] lg:text-right">
          <span className="text-[12px] uppercase tracking-[0.16em] text-text-secondary">Stay dates</span>
          <span className="text-[14px] font-semibold text-text-primary">
            {formatHostDate(reservation.checkInDate)} to {formatHostDate(reservation.checkOutDate)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-[18px] border border-border-light bg-white/80 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Guests</p>
          <p className="mt-2 text-[15px] font-semibold text-text-primary">
            {getGuestCountLabel(reservation.adultGuests, reservation.childGuests)}
          </p>
        </div>

        <div className="rounded-[18px] border border-border-light bg-white/80 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Reservation total</p>
          <p className="mt-2 text-[15px] font-semibold text-text-primary">
            {subtotal !== null ? formatHostCurrency(subtotal, currency) : "Amount pending"}
          </p>
        </div>

        <div className="rounded-[18px] border border-border-light bg-white/80 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">Created</p>
          <p className="mt-2 text-[15px] font-semibold text-text-primary">
            {formatHostDate(reservation.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};
