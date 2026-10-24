/**
 * FILE: client/src/hooks/useRazorpay.js
 * PURPOSE: Dynamically loads the Razorpay checkout script.
 */
import { useCallback } from "react";

export default function useRazorpay() {
  const loadRazorpay = useCallback(() => {
    return new Promise((resolve) => {
      // If already loaded, return true
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }, []);

  return { loadRazorpay };
}
