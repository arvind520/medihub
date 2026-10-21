/**
 * FILE: client/src/components/CreateEventForm.jsx
 * PURPOSE: A form for patients to request a helper.
 */
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function CreateEventForm({ onEventCreated }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [hospitalName, setHospitalName] = useState("");
  const [date, setDate] = useState("");
  const [durationHours, setDurationHours] = useState(2);
  const [notes, setNotes] = useState("");
  const [requirements, setRequirements] = useState([]);

  // Requirement options
  const options = [
    { id: "queue", label: "Standing in queue" },
    { id: "doctor", label: "Getting doctors" },
    { id: "guide", label: "Guiding in hospital" },
    { id: "medicine", label: "Getting medicine" },
    { id: "paperwork", label: "Paperwork" },
  ];

  // Handle checkbox changes
  const toggleRequirement = (id) => {
    if (requirements.includes(id)) {
      setRequirements(requirements.filter((r) => r !== id));
    } else {
      setRequirements([...requirements, id]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requirements.length === 0)
      return alert("Select at least one requirement");

    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/events", {
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");

      // Reset form
      setHospitalName("");
      setDate("");
      setRequirements([]);
      setNotes("");

      // Notify parent component to refresh the list
      onEventCreated(data.event);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md mb-8"
    >
      <h2 className="text-xl font-bold mb-4">Create a New Request</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Hospital Name
          </label>
          <input
            type="text"
            required
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="e.g. Apollo Hospital"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date & Time</label>
          <input
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Estimated Duration (Hours)
        </label>
        <input
          type="number"
          min="1"
          max="12"
          required
          value={durationHours}
          onChange={(e) => setDurationHours(e.target.value)}
          className="w-full md:w-1/3 border rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          What help do you need?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm">
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

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded p-2"
          rows="2"
          placeholder="e.g. I need help with my elderly father"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-sky-600 text-white px-6 py-2 rounded hover:bg-sky-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Submit Request (₹199)"}
      </button>
    </form>
  );
}
