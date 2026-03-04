import { useState } from "react";
import TimetableForm from "./TimetableForm";
import TimetableDisplay from "./TimetableDisplay";

function App() {
  const [result, setResult] = useState(null);

  return (
    <div>
      <h1>Timetable Generator</h1>
      <TimetableForm setResult={setResult} />
      <TimetableDisplay result={result} />
    </div>
  );
}

export default App;
