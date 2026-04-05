import { useState } from "react";

function JsonInputForm({ onSubmit, loading }) {
  const [jsonInput, setJsonInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      onSubmit(JSON.parse(jsonInput));
    } catch {
      alert("Invalid JSON");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Paste your timetable JSON config here..."
      />
      <br />
      <button className="btn-generate" type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate Timetable"}
      </button>
    </form>
  );
}

export default JsonInputForm;
