"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addGuestWishlistProperty, getGuestWishlist, removeGuestWishlistProperty } from "@/lib/guest";

type WishlistContextValue = {
  canUseWishlist: boolean;
  isLoaded: boolean;
  pendingPropertyId: string;
  isSaved: (propertyId: string) => boolean;
  toggle: (propertyId: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isHydrated } = useAuth();
  const canUseWishlist = Boolean(
    user &&
      token &&
      user.roles.includes("guest") &&
      !user.roles.includes("host") &&
      !user.roles.includes("admin"),
  );

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [pendingPropertyId, setPendingPropertyId] = useState("");

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!canUseWishlist || !token) {
      setSavedIds(new Set());
      setIsLoaded(true);
      return;
    }

    let isActive = true;
    setIsLoaded(false);

    getGuestWishlist(token)
      .then((items) => {
        if (isActive) {
          setSavedIds(new Set(items.map((item) => item.propertyId)));
        }
      })
      .catch(() => {
        if (isActive) {
          setSavedIds(new Set());
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoaded(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, [canUseWishlist, isHydrated, token]);

  const isSaved = useCallback((propertyId: string) => savedIds.has(propertyId), [savedIds]);

  const toggle = useCallback(
    async (propertyId: string) => {
      if (!token || !canUseWishlist || pendingPropertyId) {
        return;
      }

      const wasSaved = savedIds.has(propertyId);

      setPendingPropertyId(propertyId);
      setSavedIds((current) => {
        const next = new Set(current);
        if (wasSaved) {
          next.delete(propertyId);
        } else {
          next.add(propertyId);
        }
        return next;
      });

      try {
        if (wasSaved) {
          await removeGuestWishlistProperty(token, propertyId);
        } else {
          await addGuestWishlistProperty(token, propertyId);
        }
      } catch (error) {
        setSavedIds((current) => {
          const next = new Set(current);
          if (wasSaved) {
            next.add(propertyId);
          } else {
            next.delete(propertyId);
          }
          return next;
        });
        throw error;
      } finally {
        setPendingPropertyId("");
      }
    },
    [canUseWishlist, pendingPropertyId, savedIds, token],
  );

  const value = useMemo(
    () => ({ canUseWishlist, isLoaded, pendingPropertyId, isSaved, toggle }),
    [canUseWishlist, isLoaded, isSaved, pendingPropertyId, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
};
