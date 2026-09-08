"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  addGuestWishlistProperty,
  getGuestWishlist,
  removeGuestWishlistProperty,
  type GuestWishlistItem,
} from "@/lib/guest";

type WishlistContextValue = {
  canUseWishlist: boolean;
  isLoaded: boolean;
  items: GuestWishlistItem[];
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

  const [items, setItems] = useState<GuestWishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pendingPropertyId, setPendingPropertyId] = useState("");

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!canUseWishlist || !token) {
      setItems([]);
      setIsLoaded(true);
      return;
    }

    let isActive = true;
    setIsLoaded(false);

    getGuestWishlist(token)
      .then((result) => {
        if (isActive) {
          setItems(result);
        }
      })
      .catch(() => {
        if (isActive) {
          setItems([]);
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

  const isSaved = useCallback(
    (propertyId: string) => items.some((item) => item.propertyId === propertyId),
    [items],
  );

  const toggle = useCallback(
    async (propertyId: string) => {
      if (!token || !canUseWishlist || pendingPropertyId) {
        return;
      }

      const wasSaved = items.some((item) => item.propertyId === propertyId);

      setPendingPropertyId(propertyId);
      setItems((current) =>
        wasSaved
          ? current.filter((item) => item.propertyId !== propertyId)
          : [{ propertyId, savedAt: new Date().toISOString() }, ...current],
      );

      try {
        if (wasSaved) {
          await removeGuestWishlistProperty(token, propertyId);
        } else {
          const saved = await addGuestWishlistProperty(token, propertyId);
          setItems((current) =>
            current.map((item) => (item.propertyId === propertyId ? saved : item)),
          );
        }
      } catch (error) {
        setItems((current) =>
          wasSaved
            ? [{ propertyId, savedAt: new Date().toISOString() }, ...current]
            : current.filter((item) => item.propertyId !== propertyId),
        );
        throw error;
      } finally {
        setPendingPropertyId("");
      }
    },
    [canUseWishlist, items, pendingPropertyId, token],
  );

  const value = useMemo(
    () => ({ canUseWishlist, isLoaded, items, pendingPropertyId, isSaved, toggle }),
    [canUseWishlist, isLoaded, items, isSaved, pendingPropertyId, toggle],
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
