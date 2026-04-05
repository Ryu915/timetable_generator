import { useState } from "react";
import DivisionTable from "./DivisionTable";
import TeacherTable from "./TeacherTable";
import AiPanel from "./AiPanel";
import { buildTeacherSchedules } from "../../utils/buildTeacherSchedules";

function TimetableDisplay({ result, aiResult, loadingAI }) {
  const [view, setView] = useState("division");
  const [selected, setSelected] = useState(null);

  if (!result) return null;

  const divisions = Object.keys(result);
  const teacherSchedules = buildTeacherSchedules(result);
  const teachers = Object.keys(teacherSchedules).sort();

  const handleViewSwitch = (v) => {
    setView(v);
    setSelected(null);
  };

  return (
    <div className="content-area">
      <div className="tt-section">

        {/* View toggle */}
        <div className="view-toggle">
          <button className={view === "division" ? "toggle-btn active" : "toggle-btn"} onClick={() => handleViewSwitch("division")}>
            Division View
          </button>
          <button className={view === "teacher" ? "toggle-btn active" : "toggle-btn"} onClick={() => handleViewSwitch("teacher")}>
            Teacher View
          </button>
        </div>

        {/* Selector cards */}
        <div className="div-selector">
          {view === "division"
            ? divisions.map((div) => (
                <div key={div} className={`div-tab ${selected === div ? "active" : ""}`} onClick={() => setSelected(selected === div ? null : div)}>
                  {div}
                </div>
              ))
            : teachers.map((t) => (
                <div key={t} className={`div-tab teacher-tab ${selected === t ? "active" : ""}`} onClick={() => setSelected(selected === t ? null : t)}>
                  {t}
                </div>
              ))
          }
        </div>

        {selected ? (
          view === "division"
            ? <DivisionTable division={selected} timetable={result[selected]} />
            : <TeacherTable schedule={teacherSchedules[selected]} />
        ) : (
          <div className="hint-box">
            {view === "division" ? "Select a division above to view its timetable." : "Select a teacher above to view their schedule."}
          </div>
        )}
      </div>

      <AiPanel aiResult={aiResult} loadingAI={loadingAI} />
    </div>
  );
}

export default TimetableDisplay;
