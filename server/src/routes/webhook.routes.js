// /**
//  * FILE: server/src/routes/webhook.routes.js
//  * PURPOSE: Listens for events from Clerk (e.g., user signup).
//  * NOTE: Webhooks MUST use the raw request body to verify the signature.
//  *       We use express.raw() for this specific route.
//  */
// import express from "express";
// import { Webhook } from "svix";
// import User from "../models/User.js";

// const router = express.Router();

// // Use express.raw to keep the body as a Buffer (required for Svix verification)
// router.post(
//   "/clerk",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

//     if (!WEBHOOK_SECRET) {
//       console.error("❌ Missing CLERK_WEBHOOK_SECRET in .env");
//       return res.status(500).json({ error: "Server misconfiguration" });
//     }

//     // Get the headers Svix needs to verify the request
//     const svix_id = req.headers["svix-id"];
//     const svix_timestamp = req.headers["svix-timestamp"];
//     const svix_signature = req.headers["svix-signature"];

//     // If headers are missing, reject
//     if (!svix_id || !svix_timestamp || !svix_signature) {
//       return res.status(400).json({ error: "Missing svix headers" });
//     }

//     // Convert the raw buffer body to a string
//     const payload = req.body.toString();
//     const wh = new Webhook(WEBHOOK_SECRET);
//     let evt;

//     // Verify the webhook
//     try {
//       evt = wh.verify(payload, {
//         "svix-id": svix_id,
//         "svix-timestamp": svix_timestamp,
//         "svix-signature": svix_signature,
//       });
//     } catch (err) {
//       console.error("❌ Webhook verification failed:", err.message);
//       return res.status(400).json({ error: "Invalid signature" });
//     }

//     // Handle the event
//     const { id, email_addresses, first_name, last_name } = evt.data;
//     const eventType = evt.type;

//     if (eventType === "user.created" || eventType === "user.updated") {
//       const primaryEmail = email_addresses?.[0]?.email_address;

//       if (!primaryEmail) {
//         return res.status(400).json({ error: "No email address found" });
//       }

//       try {
//         // Upsert: Create if not exists, Update if exists
//         await User.findOneAndUpdate(
//           { clerkId: id },
//           {
//             clerkId: id,
//             email: primaryEmail,
//             firstName: first_name || "",
//             lastName: last_name || "",
//           },
//           { upsert: true, new: true }
//         );
//         console.log(`✅ User synced to DB: ${primaryEmail}`);
//       } catch (dbErr) {
//         console.error("❌ Database error:", dbErr);
//         return res.status(500).json({ error: "Database error" });
//       }
//     }

//     // Always return 200 so Clerk knows we received it
//     res.status(200).json({ received: true });
//   }
// );

// export default router;

// FILE: server/src/routes/webhook.routes.js
import express from "express";
import { Webhook } from "svix";
import User from "../models/User.js";

const router = express.Router();

router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET?.trim();

    if (!WEBHOOK_SECRET) {
      console.error("❌ Missing CLERK_WEBHOOK_SECRET");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: "Missing svix headers" });
    }

    const payload = req.body.toString();
    const wh = new Webhook(WEBHOOK_SECRET);

    try {
      wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("❌ Verification failed:", err.message);
      return res.status(400).json({ error: "Invalid signature" });
    }

    // svix 2.x: verify() returns undefined — parse manually
    const evt = JSON.parse(payload);
    const { id, email_addresses, first_name, last_name } = evt.data;
    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        return res.status(400).json({ error: "No email address found" });
      }

      try {
        await User.findOneAndUpdate(
          { clerkId: id },
          {
            clerkId: id,
            email: primaryEmail,
            firstName: first_name || "",
            lastName: last_name || "",
          },
          { upsert: true, new: true }
        );
        console.log(`✅ User synced: ${primaryEmail}`);
      } catch (dbErr) {
        console.error("❌ DB error:", dbErr);
        return res.status(500).json({ error: "Database error" });
      }
    }

    res.status(200).json({ received: true });
  }
);

export default router;
