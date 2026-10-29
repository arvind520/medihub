/**
 * FILE: client/src/components/CreateEventForm.jsx
 * PURPOSE: Form to create an event AND pay via Razorpay.
 */
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import useRazorpay from "../hooks/useRazorpay"; // 👈 We'll create this next

export default function CreateEventForm({ onEventCreated }) {
  const { getToken } = useAuth();
  const { loadRazorpay } = useRazorpay();
  const [loading, setLoading] = useState(false);

  const [hospitalName, setHospitalName] = useState("");
  const [date, setDate] = useState("");
  const [durationHours, setDurationHours] = useState(2);
  const [notes, setNotes] = useState("");
  const [requirements, setRequirements] = useState([]);

  const options = [
    { id: "queue", label: "Standing in queue" },
    { id: "doctor", label: "Getting doctors" },
    { id: "guide", label: "Guiding in hospital" },
    { id: "medicine", label: "Getting medicine" },
    { id: "paperwork", label: "Paperwork" },
  ];

  const toggleRequirement = (id) => {
    if (requirements.includes(id)) {
      setRequirements(requirements.filter((r) => r !== id));
    } else {
      setRequirements([...requirements, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requirements.length === 0)
      return alert("Select at least one requirement");

    setLoading(true);
    try {
      const token = await getToken();

      // 1. Create the event in DB
      const createRes = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hospitalName,
          date,
          durationHours,
          requirements,
          notes,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        console.error("Backend Error:", createData);
        throw new Error(createData.error || "Failed to create event");
      }

      const event = createData.event;

      // 2. Create Razorpay Order on backend
      const orderRes = await fetch(
        "http://localhost:5000/api/payments/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ eventId: event._id }),
        },
      );

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // 3. Load Razorpay script and open checkout
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load");

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MediHelp",
        description: "Hospital Assistance Booking",
        order_id: orderData.orderId,

        // This function runs when payment is successful
        handler: async function (response) {
          const freshToken = await getToken();
          // 4. Verify payment on backend
          const verifyRes = await fetch(
            "http://localhost:5000/api/payments/verify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${freshToken}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                eventId: event._id,
              }),
            },
          );

          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            alert("✅ Payment successful! Your request is now live.");
            onEventCreated(verifyData.event); // Update UI
            // Reset form
            setHospitalName("");
            setDate("");
            setRequirements([]);
            setNotes("");
          } else {
            alert("❌ Payment verification failed.");
          }
        },
      });

      rzp.open();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="workspace-card request-form mb-8"
    >
      <h2 className="form-title">Create a new request</h2>
      <p className="form-description">
        Tell us about your visit and choose the support that would help.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="form-field">
          <label>
            Hospital Name
          </label>
          <input
            type="text"
            required
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            className="form-control"
            placeholder="e.g. Apollo Hospital"
          />
        </div>
        <div className="form-field">
          <label>Date & Time</label>
          <input
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      <div className="form-field mb-4">
        <label>
          Estimated Duration (Hours)
        </label>
        <input
          type="number"
          min="1"
          max="12"
          required
          value={durationHours}
          onChange={(e) => setDurationHours(e.target.value)}
          className="form-control md:w-1/3"
        />
      </div>

      <div className="form-field mb-4">
        <label>
          What help do you need?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => (
            <label key={opt.id} className="requirement-option">
              <input
                type="checkbox"
                checked={requirements.includes(opt.id)}
                onChange={() => toggleRequirement(opt.id)}
                className="rounded"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-field mb-4">
        <label>
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-control"
          rows="2"
          placeholder="e.g. I need help with my elderly father"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="app-primary-button"
      >
        {loading ? "Processing..." : "Pay & Submit (₹199)"}
      </button>
    </form>
  );
}
