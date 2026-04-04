import { useState } from "react";

function TimetableForm({ setResult }) {
  const [inputData, setInputData] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedData = JSON.parse(inputData);
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Invalid JSON or server error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section">
      <h2>Input Configuration (JSON)</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder='Paste your timetable JSON config here...'
        />
        <br />
        <button className="btn-generate" type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Timetable"}
        </button>
      </form>
    </div>
  );
}

export default TimetableForm;
