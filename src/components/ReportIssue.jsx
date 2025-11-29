import { useState } from "react";
import { supabase } from "../lib/supabase";

function ReportIssue({ user, onSubmitSuccess }) {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState(null); // only for UI
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || !location) {
      alert("Please fill problem description and location.");
      return;
    }

    // imageFile is only for front-end demo now
    if (!imageFile) {
      const confirmNoImage = window.confirm(
        "You did not select a photo. Submit complaint without image?"
      );
      if (!confirmNoImage) return;
    }

    try {
      setLoading(true);

      // 🔹 Simple insert into existing complaints table (same as old code)
      const { error } = await supabase.from("complaints").insert([
        {
          user_id: user.id,
          name: user.full_name,
          issue: description,
          location,
          // no image_url, no DB changes required
        },
      ]);

      if (error) {
        console.error(error);
        alert("Error submitting complaint");
        return;
      }

      alert("Complaint submitted successfully!");

      setDescription("");
      setLocation("");
      setImageFile(null);

      if (onSubmitSuccess) onSubmitSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm report-issue">
      <div className="card-body">
        <h5 className="card-title mb-3">Report a Problem</h5>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Problem Description</label>
            <textarea
              className="form-control"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem..."
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-control"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter area / street name or location link"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Photo of Problem <small className="text-muted">(optional)</small>
            </label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? "Submitting..." : "Submit Issue"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportIssue;
