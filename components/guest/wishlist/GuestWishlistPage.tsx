"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { GuestShell } from "@/components/guest/GuestShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  addGuestWishlistProperty,
  getGuestPropertyLookups,
  getGuestWishlist,
  removeGuestWishlistProperty,
  type GuestWishlistItem,
} from "@/lib/guest";

const formatDate = (value: string | null) => {
  if (!value) {
    return "Recently";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const GuestWishlistPage: React.FC = () => {
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState<GuestWishlistItem[]>([]);
  const [propertyLookup, setPropertyLookup] = useState<
    Awaited<ReturnType<typeof getGuestPropertyLookups>>
  >({});
  const [propertyIdInput, setPropertyIdInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [removingPropertyId, setRemovingPropertyId] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadWishlist = async () => {
      setIsLoading(true);
      setError("");

      try {
        const result = await getGuestWishlist(token);
        const propertyIds = result.map((item) => item.propertyId).filter(Boolean);
        const lookups = await getGuestPropertyLookups(propertyIds);

        if (!isActive) {
          return;
        }

        setWishlist(result);
        setPropertyLookup(lookups);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load your wishlist right now."
            : "We couldn't load your wishlist right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadWishlist();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  const sortedWishlist = useMemo(
    () =>
      [...wishlist].sort((left, right) => {
        const leftTime = left.savedAt ? new Date(left.savedAt).getTime() : 0;
        const rightTime = right.savedAt ? new Date(right.savedAt).getTime() : 0;
        return rightTime - leftTime;
      }),
    [wishlist],
  );

  return (
    <GuestShell badge="Wishlist">
      <div className="surface-card overflow-hidden rounded-panel">
        <div className="p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Wishlist workspace
            </p>
            <h1 className="mt-2 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
              Keep your saved properties in one place
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">
              Review properties saved for later, open them again, or remove them when your shortlist changes.
            </p>
          </div>

          <div className="mt-5 border-t border-border-light pt-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <input
                type="text"
                value={propertyIdInput}
                onChange={(event) => setPropertyIdInput(event.target.value)}
                placeholder="Save a property by property id"
                className="w-full rounded-[18px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 placeholder:text-text-secondary/70 focus:-translate-y-0.5 focus:border-text-primary/15 focus:shadow-medium"
              />
              <button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  if (!token) {
                    return;
                  }

                  if (!propertyIdInput.trim()) {
                    setError("Property id is required.");
                    return;
                  }

                  setIsSaving(true);
                  setError("");
                  setSuccessMessage("");

                  try {
                    const saved = await addGuestWishlistProperty(token, propertyIdInput);
                    const propertyIds = Array.from(
                      new Set([saved.propertyId, ...wishlist.map((item) => item.propertyId)]),
                    );
                    const lookups = await getGuestPropertyLookups(propertyIds);

                    setWishlist((current) => {
                      const withoutDuplicate = current.filter(
                        (item) => item.propertyId !== saved.propertyId,
                      );
                      return [{ propertyId: saved.propertyId, savedAt: new Date().toISOString() }, ...withoutDuplicate];
                    });
                    setPropertyLookup((current) => ({ ...current, ...lookups }));
                    setPropertyIdInput("");
                    setSuccessMessage("Property saved to wishlist successfully.");
                  } catch (requestError) {
                    setError(
                      requestError instanceof ApiError
                        ? requestError.message || "Unable to save this property right now."
                        : "Unable to save this property right now.",
                    );
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save property"}
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="border-t border-border-light bg-[rgba(180,35,24,0.04)] px-5 py-4">
            <p className="text-[14px] leading-6 text-[var(--color-danger,#b42318)]">{error}</p>
          </div>
        ) : null}
        {successMessage ? (
          <div className="border-t border-border-light bg-[rgba(64,145,108,0.08)] px-5 py-4">
            <p className="text-[14px] leading-6 text-[rgb(35,92,69)]">{successMessage}</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-3 border-t border-border-light px-5 py-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-[20px] bg-white/75" />
            ))}
          </div>
        ) : sortedWishlist.length ? (
          <div className="overflow-x-auto border-t border-border-light">
            <table className="min-w-[920px] w-full border-collapse">
              <thead className="bg-[rgba(245,243,237,0.92)]">
                <tr className="border-b border-border-light">
                  {["Property", "Location", "Saved", "Action"].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedWishlist.map((item) => {
                  const property = propertyLookup[item.propertyId];

                  return (
                    <tr
                      key={item.propertyId}
                      className="border-b border-border-light last:border-b-0 odd:bg-white even:bg-[rgba(255,252,247,0.45)] hover:bg-[rgba(255,252,247,0.9)]"
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div className="min-w-0 max-w-[320px]">
                          <p className="truncate text-[14px] font-semibold text-text-primary">
                            {property?.propertyTitle || item.propertyId}
                          </p>
                          <p className="mt-1 truncate text-[12px] text-text-secondary">
                            {property?.unitNamesById ? "Saved property" : "Property details unavailable"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                        {property?.locationLabel || "Location unavailable"}
                      </td>
                      <td className="px-4 py-3.5 align-middle text-[13px] text-text-primary">
                        {formatDate(item.savedAt)}
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex flex-wrap gap-1.5">
                          <Link
                            href={`/properties/${item.propertyId}`}
                            className="inline-flex items-center justify-center rounded-[12px] border border-border bg-white px-3 py-1.5 text-[12px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                          >
                            Open
                          </Link>
                          <button
                            type="button"
                            disabled={removingPropertyId === item.propertyId}
                            onClick={async () => {
                              if (!token) {
                                return;
                              }

                              setRemovingPropertyId(item.propertyId);
                              setError("");
                              setSuccessMessage("");

                              try {
                                await removeGuestWishlistProperty(token, item.propertyId);
                                setWishlist((current) =>
                                  current.filter((entry) => entry.propertyId !== item.propertyId),
                                );
                                setSuccessMessage("Property removed from wishlist successfully.");
                              } catch (requestError) {
                                setError(
                                  requestError instanceof ApiError
                                    ? requestError.message || "Unable to remove this property right now."
                                    : "Unable to remove this property right now.",
                                );
                              } finally {
                                setRemovingPropertyId("");
                              }
                            }}
                            className="inline-flex items-center justify-center rounded-[12px] border border-red-200 bg-red-50/80 px-3 py-1.5 text-[12px] font-semibold text-[rgb(140,50,50)] shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {removingPropertyId === item.propertyId ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-t border-border-light px-5 py-10 text-center">
            <p className="text-[15px] font-semibold text-text-primary">No saved properties yet</p>
            <p className="mt-2 text-[14px] leading-6 text-text-secondary">
              Save approved properties to build your shortlist for later decisions.
            </p>
          </div>
        )}
      </div>
    </GuestShell>
  );
};
