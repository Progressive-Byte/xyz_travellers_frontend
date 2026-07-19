"use client";

import Link from "next/link";
import React from "react";
import { HostPropertyStatusPill } from "@/components/host/properties/HostPropertyStatusPill";
import { isHostPropertyEditable, type HostPropertySummary } from "@/lib/host";

type HostPropertiesListProps = {
  properties: HostPropertySummary[];
  deletingPropertyId?: string;
  onDelete?: (property: HostPropertySummary) => Promise<void>;
};

const formatUpdatedAt = (value: string | null) => {
  if (!value) {
    return "Recently updated";
  }

  return new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const HostPropertiesList: React.FC<HostPropertiesListProps> = ({
  properties,
  deletingPropertyId = "",
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full border-collapse">
        <thead className="bg-[rgba(245,243,237,0.92)]">
          <tr className="border-b border-border-light">
            {["Property", "Type", "Ownership", "Location", "Status", "Updated", "Actions"].map(
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
          {properties.map((property) => {
            const canEdit = isHostPropertyEditable(property.status);
            const editHref = canEdit
              ? `/host/properties/${property.id}/continue`
              : `/host/properties/${property.id}/verification`;

            return (
              <tr
                key={property.id}
                className="border-b border-border-light last:border-b-0 odd:bg-white even:bg-[rgba(255,252,247,0.45)] hover:bg-[rgba(255,252,247,0.9)]"
              >
                <td className="px-4 py-3.5 align-middle">
                  <div className="min-w-0 max-w-[280px]">
                    <p className="truncate text-[14px] font-semibold text-text-primary">
                      {property.name || "Untitled property"}
                    </p>
                    <p className="mt-1 truncate text-[12px] leading-5 text-text-secondary">
                      {property.address || "Draft location pending"}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span className="text-[13px] font-medium text-text-primary">
                    {property.propertyType || "Not set"}
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-[12px] font-medium capitalize text-text-primary">
                    {property.ownershipType || "Not set"}
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span className="text-[13px] text-text-primary">
                    {[property.city, property.country].filter(Boolean).join(", ") || "Not set"}
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <HostPropertyStatusPill status={property.status} />
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span className="text-[13px] text-text-primary">
                    {formatUpdatedAt(property.updatedAt)}
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <div className="flex flex-wrap gap-1.5">
                    <Link
                      href={editHref}
                      className="inline-flex items-center justify-center rounded-[12px] bg-primary px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover"
                    >
                      {canEdit ? (property.status === "rejected" ? "Fix" : "Edit") : "View"}
                    </Link>

                    <Link
                      href={`/host/properties/${property.id}/verification`}
                      className="inline-flex items-center justify-center rounded-[12px] border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                    >
                      Verify
                    </Link>

                    {canEdit && onDelete ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Delete this property draft? This also removes its media, units, calendars, pricing, and verification files.",
                            )
                          ) {
                            void onDelete(property);
                          }
                        }}
                        disabled={deletingPropertyId === property.id}
                        className="inline-flex items-center justify-center rounded-[12px] border border-red-200 bg-red-50/80 px-3 py-1.5 text-[12px] font-semibold text-[rgb(140,50,50)] shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingPropertyId === property.id ? "Deleting..." : "Delete"}
                      </button>
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
