"use client";

import Link from "next/link";
import React from "react";
import {
  formatHostCurrency,
  formatHostDate,
  getGuestCountLabel,
  getReservationStatusClasses,
  getReservationStatusLabel,
} from "@/components/host/operations/hostOperations";
import { type HostReservation } from "@/lib/host";

type HostReservationsListProps = {
  reservations: HostReservation[];
};

export const HostReservationsList: React.FC<HostReservationsListProps> = ({ reservations }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full border-collapse">
        <thead className="bg-[rgba(245,243,237,0.92)]">
          <tr className="border-b border-border-light">
            {["Reservation", "Stay", "Guests", "Total", "Status", "Created", "Actions"].map(
              (heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody>
          {reservations.map((reservation) => {
            const currency = reservation.pricingSnapshot.currency || "BDT";
            const subtotal = reservation.pricingSnapshot.subtotal;

            return (
              <tr
                key={reservation.id}
                className="border-b border-border-light last:border-b-0 odd:bg-white even:bg-[rgba(255,252,247,0.45)] hover:bg-[rgba(255,252,247,0.9)]"
              >
                <td className="px-4 py-3.5 align-middle">
                  <div className="min-w-0 max-w-[280px]">
                    <p className="truncate text-[14px] font-semibold text-text-primary">
                      {reservation.propertyName || "Property pending"}
                    </p>
                    <p className="mt-1 truncate text-[12px] leading-5 text-text-secondary">
                      {reservation.unitName || "Unit pending"} ·{" "}
                      {reservation.guestName || "Guest pending"}
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-text-secondary">
                      Reservation #{reservation.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span className="text-[13px] text-text-primary">
                    {formatHostDate(reservation.checkInDate)} to{" "}
                    {formatHostDate(reservation.checkOutDate)}
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span className="text-[13px] text-text-primary">
                    {getGuestCountLabel(reservation.adultGuests, reservation.childGuests)}
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span className="text-[13px] font-semibold text-text-primary">
                    {subtotal !== null ? formatHostCurrency(subtotal, currency) : "Amount pending"}
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-[12px] font-semibold ${getReservationStatusClasses(reservation.status)}`}
                  >
                    {getReservationStatusLabel(reservation.status)}
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span className="text-[13px] text-text-primary">
                    {formatHostDate(reservation.createdAt)}
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <div className="flex flex-wrap gap-1.5">
                    <Link
                      href={`/host/reservations/${reservation.id}`}
                      className="inline-flex items-center justify-center rounded-[12px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                    >
                      Open
                    </Link>
                    {reservation.guestId ? (
                      <Link
                        href={`/host/messages?reservationId=${reservation.id}`}
                        className="inline-flex items-center justify-center rounded-[12px] border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                      >
                        Message
                      </Link>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
