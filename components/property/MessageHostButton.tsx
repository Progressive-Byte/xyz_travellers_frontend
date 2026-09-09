"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { startGuestPropertyInquiry } from "@/lib/guest";

const TOOLTIP_OPEN_EVENT = "xyz-favorite-tooltip-open";

type MessageHostButtonProps = {
  propertyId: string;
  className?: string;
};

type TooltipState = {
  message: string;
  top: number;
  left: number;
  width: number;
  arrowLeft: number;
  placement: "top" | "bottom";
};

const TOOLTIP_MAX_WIDTH = 264;
const VIEWPORT_MARGIN = 12;
const ESTIMATED_TOOLTIP_HEIGHT = 72;

export const MessageHostButton: React.FC<MessageHostButtonProps> = ({ propertyId, className = "" }) => {
  const router = useRouter();
  const { user, token, isAuthenticated, isHydrated } = useAuth();
  const canMessageHost = Boolean(
    user &&
      token &&
      user.roles.includes("guest") &&
      !user.roles.includes("host") &&
      !user.roles.includes("admin"),
  );

  const [isPending, setIsPending] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [entered, setEntered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const instanceId = useId();

  useEffect(() => {
    const closeIfOtherInstance = (event: Event) => {
      const openedId = (event as CustomEvent<string>).detail;
      if (openedId !== instanceId) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setTooltip(null);
      }
    };

    window.addEventListener(TOOLTIP_OPEN_EVENT, closeIfOtherInstance);
    return () => {
      window.removeEventListener(TOOLTIP_OPEN_EVENT, closeIfOtherInstance);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [instanceId]);

  useEffect(() => {
    if (!tooltip) {
      setEntered(false);
      return;
    }
    const raf = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(raf);
  }, [tooltip]);

  const showNotice = (message: string) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const width = Math.min(TOOLTIP_MAX_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
    let left = rect.right - width;
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - width - VIEWPORT_MARGIN));

    const spaceBelow = window.innerHeight - rect.bottom;
    const placement: "top" | "bottom" =
      spaceBelow < ESTIMATED_TOOLTIP_HEIGHT + VIEWPORT_MARGIN && rect.top > ESTIMATED_TOOLTIP_HEIGHT
        ? "top"
        : "bottom";
    const top = placement === "bottom" ? rect.bottom + 10 : rect.top - 10;

    const buttonCenter = rect.left + rect.width / 2;
    const arrowLeft = Math.max(18, Math.min(buttonCenter - left, width - 18));

    window.dispatchEvent(new CustomEvent(TOOLTIP_OPEN_EVENT, { detail: instanceId }));

    setEntered(false);
    setTooltip({ message, top, left, width, arrowLeft, placement });

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => setTooltip(null), 3200);
  };

  const handleClick = async () => {
    if (!isHydrated || isPending) {
      return;
    }

    if (!canMessageHost || !token) {
      showNotice(
        isAuthenticated
          ? "Only guest accounts can message hosts."
          : "Log in as a guest to message this host.",
      );
      return;
    }

    setIsPending(true);

    try {
      const thread = await startGuestPropertyInquiry(token, propertyId);
      router.push(`/guest/messages/${thread.id}`);
    } catch (error) {
      showNotice(error instanceof ApiError ? error.message : "Unable to start this conversation right now.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <span className={className}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Starting..." : "Message host"}
      </button>

      {tooltip && typeof document !== "undefined"
        ? createPortal(
            <div
              role="status"
              style={{
                top: tooltip.top,
                left: tooltip.left,
                width: tooltip.width,
                transform:
                  tooltip.placement === "top"
                    ? `translateY(calc(-100% + ${entered ? "0px" : "4px"}))`
                    : entered
                      ? "translateY(0)"
                      : "translateY(-4px)",
              }}
              className={`fixed z-[999] rounded-2xl bg-text-primary px-4 py-3 text-[13px] font-medium leading-5 text-white shadow-strong transition-opacity duration-200 ${
                entered ? "opacity-100" : "opacity-0"
              }`}
            >
              <span
                className={`absolute h-3 w-3 rotate-45 bg-text-primary ${
                  tooltip.placement === "bottom" ? "-top-1.5" : "-bottom-1.5"
                }`}
                style={{ left: tooltip.arrowLeft, marginLeft: -6 }}
              />
              {tooltip.message}
            </div>,
            document.body,
          )
        : null}
    </span>
  );
};
