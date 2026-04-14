import { useState } from "react";
import TimetableForm from "./components/form/TimetableForm";
import TimetableDisplay from "./components/display/TimetableDisplay";
import "./App.css";

function App() {
  const [result, setResult] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleResult = async (data) => {
    setResult(data);
    setLoadingAI(true);
    try {
      const res = await fetch("http://localhost:5000/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timetable: data }),
      });
      const ai = await res.json();
      setAiResult(ai);
    } catch {
      setAiResult({ error: "AI evaluation failed" });
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="page">
      <div className="app-header">
        <h1>Timetable Generator.</h1>
        <p>Fill the form or paste JSON to generate and explore division &amp; teacher timetables</p>
      </div>
      <TimetableForm setResult={handleResult} />
      <TimetableDisplay result={result} aiResult={aiResult} loadingAI={loadingAI} />
    </div>
  );
}

export default App;
