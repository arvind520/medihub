/**
 * FILE: server/src/routes/payment.routes.js
 * PURPOSE: Handles Razorpay order creation and verification.
 */
import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { getAuth } from "@clerk/express";
import Event from "../models/Event.js";

const router = Router();

// Initialize Razorpay with keys from .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payments/create-order
 * PROTECTED: Creates a Razorpay order for an event.
 */
router.post("/create-order", async (req, res, next) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const { eventId } = req.body;

    // 1. Find the event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.patientId !== clerkId)
      return res.status(403).json({ error: "Forbidden" });

    // 2. Create Razorpay order
    // Razorpay expects amounts in paise (₹199 = 19900 paise)
    const options = {
      amount: event.amount * 100,
      currency: "INR",
      receipt: `receipt_${event._id}`,
    };

    const order = await razorpay.orders.create(options);

    // 3. Save the order ID to the event
    event.razorpayOrderId = order.id;
    await event.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/verify
 * PROTECTED: Verifies the payment signature after successful checkout.
 */
router.post("/verify", async (req, res, next) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
    } = req.body;

    // 1. Verify the signature mathematically
    // This proves the payment actually came from Razorpay and wasn't faked by the frontend
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // 2. Update the Event to 'open' so helpers can see it
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        status: "open",
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true },
    );

    res.json({ success: true, event: updatedEvent });
  } catch (err) {
    next(err);
  }
});

export default router;
