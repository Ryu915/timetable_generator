// src/components/TimetableForm.jsx
import { useState } from "react";

function TimetableForm({ setResult }) {
  const [inputData, setInputData] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const parsedData = JSON.parse(inputData);

      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Invalid JSON or server error");
      console.error(error);
    }
  };

  const handleEvaluate = async () => {
    if (!timetable) return;
    setEvaluating(true);
    try {
      const response = await fetch("http://localhost:5000/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timetable }),
      });

      const data = await response.json();
      setAiFeedback(data);
    } catch (error) {
      alert("AI evaluation failed");
      console.error(error);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div>
      <h2>Enter Timetable Input (JSON)</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="15"
          cols="60"
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder='Paste your JSON here'
        />
        <br />
        <button type="submit">Generate Timetable</button>
      </form>
    </div>
  );
}

export default TimetableForm;