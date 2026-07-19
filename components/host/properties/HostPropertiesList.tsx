"use client";

import React from "react";
import { HostPropertyCard } from "@/components/host/properties/HostPropertyCard";
import { type HostPropertySummary } from "@/lib/host";

type HostPropertiesListProps = {
  properties: HostPropertySummary[];
};

export const HostPropertiesList: React.FC<HostPropertiesListProps> = ({ properties }) => {
  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <HostPropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};
