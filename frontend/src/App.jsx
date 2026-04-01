import { useState } from "react";
import TimetableForm from "./TimetableForm";
import TimetableDisplay from "./TimetableDisplay";

function App() {
  const [result, setResult] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const evaluateTimetable = async (timetable) => {
    const res = await fetch("http://localhost:5000/ai/evaluate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ timetable }),
    });
    
    return await res.json();
  };

  const handleResult = async (data) => {
    setResult(data);

    setLoadingAI(true);
    const ai = await evaluateTimetable(data);

    console.log("AI RESULT:", ai);


    setAiResult(ai);
    setLoadingAI(false);
  };

  return (
    <div>
      <h1>Timetable Generator</h1>
      <TimetableForm setResult={handleResult} />
      <TimetableDisplay
        result={result}
        aiResult={aiResult}
        loadingAI={loadingAI}
      />
    </div>
  );
}

export default App;
