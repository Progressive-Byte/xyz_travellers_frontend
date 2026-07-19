"use client";

import React from "react";
import { HostReservationCard } from "@/components/host/operations/reservations/HostReservationCard";
import { type HostReservation } from "@/lib/host";

type HostReservationsListProps = {
  reservations: HostReservation[];
};

export const HostReservationsList: React.FC<HostReservationsListProps> = ({ reservations }) => {
  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <HostReservationCard key={reservation.id} reservation={reservation} />
      ))}
    </div>
  );
};
