"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GuestShell } from "@/components/guest/GuestShell";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  blockGuestUser,
  getGuestBookings,
  getGuestMessageThread,
  getGuestMessageThreads,
  getGuestPropertyLookups,
  reportGuestListing,
  reportGuestUser,
  unblockGuestUser,
  type GuestBooking,
  type GuestMessageThreadSummary,
} from "@/lib/guest";

const listingReasonOptions = [
  "unsafe_listing",
  "misleading_information",
  "fraud_suspected",
  "other",
];

const userReasonOptions = [
  "abusive_behavior",
  "harassment",
  "fraud_suspected",
  "other",
];

export const GuestSafetyPage: React.FC<{
  initialThreadId?: string;
  initialUserId?: string;
  initialReservationId?: string;
}> = ({ initialThreadId = "", initialUserId = "", initialReservationId = "" }) => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<GuestBooking[]>([]);
  const [threads, setThreads] = useState<GuestMessageThreadSummary[]>([]);
  const [propertyLookup, setPropertyLookup] = useState<
    Awaited<ReturnType<typeof getGuestPropertyLookups>>
  >({});
  const [listingReservationId, setListingReservationId] = useState(initialReservationId);
  const [listingReasonCode, setListingReasonCode] = useState(listingReasonOptions[0]);
  const [listingDetails, setListingDetails] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState(initialThreadId);
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [userReasonCode, setUserReasonCode] = useState(userReasonOptions[0]);
  const [userDetails, setUserDetails] = useState("");
  const [hostUserOptions, setHostUserOptions] = useState<string[]>(initialUserId ? [initialUserId] : []);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);
  const [isSubmittingUserAction, setIsSubmittingUserAction] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    const loadSafetyContext = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [bookingResults, threadResults] = await Promise.all([
          getGuestBookings(token),
          getGuestMessageThreads(token),
        ]);
        const propertyIds = Array.from(
          new Set(bookingResults.map((item) => item.propertyId).filter(Boolean)),
        );
        const lookups = await getGuestPropertyLookups(propertyIds);

        if (!isActive) {
          return;
        }

        setBookings(bookingResults);
        setThreads(threadResults);
        setPropertyLookup(lookups);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(
          requestError instanceof ApiError
            ? requestError.message || "We couldn't load the safety workspace right now."
            : "We couldn't load the safety workspace right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadSafetyContext();

    return () => {
      isActive = false;
    };
  }, [retryKey, token]);

  useEffect(() => {
    if (!token || !selectedThreadId) {
      return;
    }

    let isActive = true;

    const loadThreadParticipants = async () => {
      try {
        const thread = await getGuestMessageThread(token, selectedThreadId);

        if (!isActive) {
          return;
        }

        const hostIds = Array.from(
          new Set(
            thread.messages
              .filter((message) => message.senderRole.trim().toLowerCase() === "host")
              .map((message) => message.senderId)
              .filter(Boolean),
          ),
        );

        setHostUserOptions(hostIds);
        if (hostIds.length && !hostIds.includes(selectedUserId)) {
          setSelectedUserId(hostIds[0]);
        }
      } catch {
        // Keep the form usable even if host ids cannot be derived from the thread.
      }
    };

    void loadThreadParticipants();

    return () => {
      isActive = false;
    };
  }, [selectedThreadId, selectedUserId, token]);

  const bookingOptions = useMemo(
    () =>
      bookings.map((booking) => ({
        booking,
        property: propertyLookup[booking.propertyId],
      })),
    [bookings, propertyLookup],
  );
  const selectedBooking = bookingOptions.find((entry) => entry.booking.id === listingReservationId)?.booking;

  return (
    <GuestShell badge="Safety">
      <div className="space-y-6">
        <section className="surface-card rounded-panel p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Safety center
          </p>
          <h1 className="mt-2 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary">
            Report concerns and manage host safety actions
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-text-secondary">
            Use this space to report unsafe listings, report a user, or block and unblock a host user tied to your reservations.
          </p>
        </section>

        {error ? (
          <div className="rounded-[20px] border border-[var(--color-danger,#b42318)]/15 bg-[rgba(180,35,24,0.04)] px-4 py-3 text-[14px] text-[var(--color-danger,#b42318)]">
            {error}
          </div>
        ) : null}
        {successMessage ? (
          <div className="rounded-[20px] border border-[rgba(64,145,108,0.16)] bg-[rgba(64,145,108,0.08)] px-4 py-3 text-[14px] text-[rgb(35,92,69)]">
            {successMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="surface-card h-[360px] animate-pulse rounded-panel bg-white/75" />
            <div className="surface-card h-[360px] animate-pulse rounded-panel bg-white/75" />
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="surface-card rounded-panel p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Report listing
              </p>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Reservation
                  </span>
                  <select
                    value={listingReservationId}
                    onChange={(event) => setListingReservationId(event.target.value)}
                    className="w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
                  >
                    <option value="">Select reservation</option>
                    {bookingOptions.map(({ booking, property }) => (
                      <option key={booking.id} value={booking.id}>
                        {(property?.propertyTitle || booking.propertyId) + " - " + booking.id.slice(-6).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Reason code
                  </span>
                  <select
                    value={listingReasonCode}
                    onChange={(event) => setListingReasonCode(event.target.value)}
                    className="w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
                  >
                    {listingReasonOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Details
                  </span>
                  <textarea
                    rows={5}
                    value={listingDetails}
                    onChange={(event) => setListingDetails(event.target.value)}
                    className="w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
                  />
                </label>

                <button
                  type="button"
                  disabled={isSubmittingListing}
                  onClick={async () => {
                    if (!token) {
                      return;
                    }

                    if (!selectedBooking?.propertyId || !selectedBooking.id) {
                      setError("Select a reservation before reporting a listing.");
                      return;
                    }

                    setIsSubmittingListing(true);
                    setError("");
                    setSuccessMessage("");

                    try {
                      await reportGuestListing(token, {
                        propertyId: selectedBooking.propertyId,
                        reservationId: selectedBooking.id,
                        reasonCode: listingReasonCode,
                        details: listingDetails,
                      });
                      setListingDetails("");
                      setSuccessMessage("Listing report submitted successfully.");
                    } catch (requestError) {
                      setError(
                        requestError instanceof ApiError
                          ? requestError.message || "Unable to submit the listing report right now."
                          : "Unable to submit the listing report right now.",
                      );
                    } finally {
                      setIsSubmittingListing(false);
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingListing ? "Submitting..." : "Submit listing report"}
                </button>
              </div>
            </section>

            <section className="surface-card rounded-panel p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                User safety actions
              </p>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Message thread
                  </span>
                  <select
                    value={selectedThreadId}
                    onChange={(event) => setSelectedThreadId(event.target.value)}
                    className="w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
                  >
                    <option value="">Select message thread</option>
                    {threads.map((thread) => (
                      <option key={thread.id} value={thread.id}>
                        {thread.reservationId.slice(-6).toUpperCase() + " - " + (propertyLookup[thread.propertyId]?.propertyTitle || thread.propertyId)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Host user id
                  </span>
                  <select
                    value={selectedUserId}
                    onChange={(event) => setSelectedUserId(event.target.value)}
                    className="w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
                  >
                    <option value="">Select user id</option>
                    {hostUserOptions.map((userId) => (
                      <option key={userId} value={userId}>
                        {userId}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Reason code
                  </span>
                  <select
                    value={userReasonCode}
                    onChange={(event) => setUserReasonCode(event.target.value)}
                    className="w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
                  >
                    {userReasonOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Details
                  </span>
                  <textarea
                    rows={5}
                    value={userDetails}
                    onChange={(event) => setUserDetails(event.target.value)}
                    className="w-full rounded-[20px] border border-border bg-card px-4 py-3 text-[14px] text-text-primary shadow-soft outline-none transition-all duration-200 focus:-translate-y-0.5 focus:border-text-primary/20 focus:shadow-medium"
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={isSubmittingUserAction}
                    onClick={async () => {
                      if (!token) {
                        return;
                      }

                      if (!selectedUserId || !selectedThreadId) {
                        setError("Select a thread and host user before reporting a user.");
                        return;
                      }

                      const selectedThread = threads.find((thread) => thread.id === selectedThreadId);

                      setIsSubmittingUserAction(true);
                      setError("");
                      setSuccessMessage("");

                      try {
                        await reportGuestUser(token, {
                          userId: selectedUserId,
                          reservationId: selectedThread?.reservationId || initialReservationId,
                          reasonCode: userReasonCode,
                          details: userDetails,
                        });
                        setUserDetails("");
                        setSuccessMessage("User report submitted successfully.");
                      } catch (requestError) {
                        setError(
                          requestError instanceof ApiError
                            ? requestError.message || "Unable to submit the user report right now."
                            : "Unable to submit the user report right now.",
                        );
                      } finally {
                        setIsSubmittingUserAction(false);
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-[18px] bg-primary px-5 py-3 text-[14px] font-semibold text-text-primary shadow-glow transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Report user
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingUserAction}
                    onClick={async () => {
                      if (!token || !selectedUserId) {
                        setError("Select a host user before blocking.");
                        return;
                      }

                      setIsSubmittingUserAction(true);
                      setError("");
                      setSuccessMessage("");

                      try {
                        await blockGuestUser(token, selectedUserId);
                        setSuccessMessage("User blocked successfully.");
                      } catch (requestError) {
                        setError(
                          requestError instanceof ApiError
                            ? requestError.message || "Unable to block this user right now."
                            : "Unable to block this user right now.",
                        );
                      } finally {
                        setIsSubmittingUserAction(false);
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Block user
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingUserAction}
                    onClick={async () => {
                      if (!token || !selectedUserId) {
                        setError("Select a host user before unblocking.");
                        return;
                      }

                      setIsSubmittingUserAction(true);
                      setError("");
                      setSuccessMessage("");

                      try {
                        await unblockGuestUser(token, selectedUserId);
                        setSuccessMessage("User unblocked successfully.");
                      } catch (requestError) {
                        setError(
                          requestError instanceof ApiError
                            ? requestError.message || "Unable to unblock this user right now."
                            : "Unable to unblock this user right now.",
                        );
                      } finally {
                        setIsSubmittingUserAction(false);
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Unblock user
                  </button>
                </div>

                <p className="text-[12px] leading-6 text-text-secondary">
                  Host user ids are derived from conversation messages because the current API set does not include a blocked-users list endpoint yet.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </GuestShell>
  );
};
