import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import { supabase } from "../lib/supabase";

import { useAuth } from "../hooks/useAuth";

export default function ActivityTracker() {
  const { user } = useAuth();

  const lastUpdateRef =
    useRef(0);

  const updateActivity =
    useCallback(async () => {
      if (!user) {
        return;
      }

      const now =
        Date.now();

      /*
       * Database ko baar-baar update
       * nahi karna.
       *
       * Minimum 60 seconds ka gap.
       */

      if (
        now -
          lastUpdateRef.current <
        60_000
      ) {
        return;
      }

      lastUpdateRef.current =
        now;

      const {
        error,
      } = await supabase.rpc(
        "update_last_active"
      );

      if (error) {
        console.error(
          "LAST ACTIVE UPDATE ERROR:",
          error
        );
      }
    }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    /*
     * User website par login karke
     * aaya hai.
     */

    updateActivity();

    /*
     * Common website activity events.
     */

    const handleActivity =
      () => {
        updateActivity();
      };

    window.addEventListener(
      "pointerdown",
      handleActivity
    );

    window.addEventListener(
      "keydown",
      handleActivity
    );

    window.addEventListener(
      "scroll",
      handleActivity
    );

    window.addEventListener(
      "touchstart",
      handleActivity
    );

    /*
     * Agar user continuously website
     * par hai, to har 60 seconds
     * activity timestamp refresh karo.
     */

    const interval =
      window.setInterval(
        () => {
          updateActivity();
        },
        60_000
      );

    /*
     * Tab dobara visible hone par
     * activity update karo.
     */

    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          updateActivity();
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        handleActivity
      );

      window.removeEventListener(
        "keydown",
        handleActivity
      );

      window.removeEventListener(
        "scroll",
        handleActivity
      );

      window.removeEventListener(
        "touchstart",
        handleActivity
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      window.clearInterval(
        interval
      );
    };
  }, [
    user,
    updateActivity,
  ]);

  return null;
}