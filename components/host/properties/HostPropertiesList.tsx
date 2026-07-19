"use client";

import React from "react";
import { HostPropertyCard } from "@/components/host/properties/HostPropertyCard";
import { type HostPropertySummary } from "@/lib/host";

type HostPropertiesListProps = {
  properties: HostPropertySummary[];
  deletingPropertyId?: string;
  onDelete?: (property: HostPropertySummary) => Promise<void>;
};

export const HostPropertiesList: React.FC<HostPropertiesListProps> = ({
  properties,
  deletingPropertyId = "",
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <HostPropertyCard
          key={property.id}
          property={property}
          isDeleting={deletingPropertyId === property.id}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
