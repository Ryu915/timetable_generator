// src/components/TimetableForm.jsx
import { useState } from "react";

function TimetableForm({ setResult }) {
  const [inputData, setInputData] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const parsedData = JSON.parse(inputData);

      const response = await fetch("http://127.0.0.1:5000/generate", {
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