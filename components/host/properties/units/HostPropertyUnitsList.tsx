"use client";

import React from "react";
import { HostPropertyUnitCard } from "@/components/host/properties/units/HostPropertyUnitCard";
import { type HostPropertyUnit } from "@/lib/host";

type HostPropertyUnitsListProps = {
  units: HostPropertyUnit[];
  disabled?: boolean;
  deletingUnitId?: string | null;
  onEdit: (unit: HostPropertyUnit) => void;
  onDelete: (unit: HostPropertyUnit) => void;
};

export const HostPropertyUnitsList: React.FC<HostPropertyUnitsListProps> = ({
  units,
  disabled = false,
  deletingUnitId = null,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      {units.map((unit) => (
        <HostPropertyUnitCard
          key={unit.id}
          unit={unit}
          disabled={disabled}
          isDeleting={deletingUnitId === unit.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
