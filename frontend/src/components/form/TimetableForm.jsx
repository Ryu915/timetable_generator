import { useState } from "react";
import JsonInputForm from "./JsonInputForm";
import StructuredForm from "./StructuredForm";

function TimetableForm({ setResult }) {
  const [mode, setMode] = useState("form");
  const [loading, setLoading] = useState(false);

  const submit = async (payload) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Server error. Make sure the backend is running.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section">
      <div className="input-mode-toggle">
        <button type="button" className={mode === "form" ? "toggle-btn active" : "toggle-btn"} onClick={() => setMode("form")}>
          Form Input
        </button>
        <button type="button" className={mode === "json" ? "toggle-btn active" : "toggle-btn"} onClick={() => setMode("json")}>
          JSON Input
        </button>
      </div>

      {mode === "json"
        ? <JsonInputForm onSubmit={submit} loading={loading} />
        : <StructuredForm onSubmit={submit} loading={loading} />
      }
    </div>
  );
}

export default TimetableForm;
