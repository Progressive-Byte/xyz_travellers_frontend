"use client";

import React from "react";
import { type HostBusiness } from "@/lib/host";

type HostBusinessesListProps = {
  businesses: HostBusiness[];
  selectedBusinessId: string;
  deletingBusinessId: string;
  onSelect: (businessId: string) => void;
  onEdit: (businessId: string) => void;
  onDelete: (businessId: string) => void;
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

export const HostBusinessesList: React.FC<HostBusinessesListProps> = ({
  businesses,
  selectedBusinessId,
  deletingBusinessId,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const getStatusLabel = (business: HostBusiness) => (business.isActive ? "active" : "inactive");

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[940px] w-full border-collapse">
        <thead className="bg-[rgba(245,243,237,0.92)]">
          <tr className="border-b border-border-light">
            {["Business", "Registration", "Primary contact", "Status", "Updated", "Actions"].map(
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
          {businesses.map((business) => {
            const isSelected = selectedBusinessId === business.id;

            return (
              <tr
                key={business.id}
                className={`border-b border-border-light last:border-b-0 ${
                  isSelected
                    ? "bg-primary-light/45"
                    : "odd:bg-white even:bg-[rgba(255,252,247,0.45)] hover:bg-[rgba(255,252,247,0.9)]"
                }`}
              >
                <td className="px-4 py-3.5 align-middle">
                  <div className="min-w-0 max-w-[260px]">
                    <p className="truncate text-[14px] font-semibold text-text-primary">
                      {business.name || "Untitled business"}
                    </p>
                    <p className="mt-1 truncate text-[12px] leading-5 text-text-secondary">
                      {business.address || "No address added"}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span className="text-[13px] text-text-primary">
                    {business.registrationNumber || "Not set"}
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <div className="min-w-0 max-w-[220px]">
                    <p className="truncate text-[13px] text-text-primary">
                      {business.contactName || "Not set"}
                    </p>
                    <p className="mt-1 truncate text-[12px] text-text-secondary">
                      {business.contactEmail || business.contactPhone || "No contact details"}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-[12px] font-medium capitalize text-text-primary">
                    {getStatusLabel(business)}
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <span className="text-[13px] text-text-primary">
                    {formatUpdatedAt(business.updatedAt)}
                  </span>
                </td>

                <td className="px-4 py-3.5 align-middle">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelect(business.id)}
                      className={`inline-flex items-center justify-center rounded-[12px] px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 ${
                        isSelected
                          ? "bg-primary text-text-primary shadow-glow"
                          : "border border-border bg-white text-text-primary shadow-soft hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                      }`}
                    >
                      {isSelected ? "Selected" : "Open"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(business.id)}
                      className="inline-flex items-center justify-center rounded-[12px] border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(business.id)}
                      disabled={deletingBusinessId === business.id}
                      className="inline-flex items-center justify-center rounded-[12px] border border-red-200 bg-red-50/80 px-3 py-1.5 text-[12px] font-semibold text-red-700 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70"
                    >
                      {deletingBusinessId === business.id ? "Deleting..." : "Delete"}
                    </button>
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
