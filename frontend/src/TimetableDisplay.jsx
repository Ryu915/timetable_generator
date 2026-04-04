import { useState } from "react";

const TIME_SLOTS = [
  "08:45 – 09:45",
  "09:45 – 10:45",
  "11:00 – 12:00",
  "12:00 – 01:00",
  "01:45 – 02:45",
  "02:45 – 03:45",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Build a per-teacher schedule by scanning all division timetables
function buildTeacherSchedules(result) {
  const schedules = {}; // { teacherName: { day: [slot0, slot1, ...] } }

  Object.entries(result).forEach(([division, timetable]) => {
    DAYS.forEach((day) => {
      (timetable[day] || []).forEach((slot, slotIndex) => {
        if (!slot || !slot.teacher) return;
        const name = slot.teacher;
        if (!schedules[name]) {
          schedules[name] = {};
          DAYS.forEach((d) => { schedules[name][d] = Array(TIME_SLOTS.length).fill(null); });
        }
        // avoid overwriting with duplicate lab slot
        if (!schedules[name][day][slotIndex]) {
          schedules[name][day][slotIndex] = { ...slot, division };
        }
      });
    });
  });

  return schedules;
}

function TimetableDisplay({ result, aiResult, loadingAI }) {
  const [view, setView] = useState("division"); // "division" | "teacher"
  const [selected, setSelected] = useState(null);

  if (!result) return null;

  const divisions = Object.keys(result);
  const teacherSchedules = buildTeacherSchedules(result);
  const teachers = Object.keys(teacherSchedules).sort();

  const renderDivisionTable = (division) => {
    const timetable = result[division];
    const skipMap = {};

    return (
      <div className="tt-wrap">
        <table className="tt-table">
          <thead>
            <tr>
              <th>Time</th>
              {DAYS.map((d) => <th key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((timeLabel, slotIndex) => {
              const rows = [];
              rows.push(
                <tr key={`slot-${slotIndex}`}>
                  <td className="time-col">{timeLabel}</td>
                  {DAYS.map((day) => {
                    const key = `${day}-${slotIndex}`;
                    if (skipMap[key]) return null;

                    const slot = timetable[day]?.[slotIndex];
                    if (!slot) return <td key={key}><span className="cell-empty">—</span></td>;

                    const nextSlot = timetable[day]?.[slotIndex + 1];
                    const isLabDouble =
                      slot.type === "lab" &&
                      nextSlot?.type === "lab" &&
                      nextSlot.subject === slot.subject &&
                      nextSlot.teacher === slot.teacher;

                    if (isLabDouble) skipMap[`${day}-${slotIndex + 1}`] = true;

                    const roomText = Array.isArray(slot.room) ? slot.room.join(", ") : slot.room;
                    const cellClass = slot.type === "lab" ? "lab-cell" : slot.type === "theory" ? "theory-cell" : "";

                    return (
                      <td key={key} rowSpan={isLabDouble ? 2 : 1} className={cellClass}>
                        <span className="cell-subj">{slot.subject}</span>
                        <span className="cell-info">{slot.teacher}</span>
                        <span className="cell-info">{roomText}</span>
                      </td>
                    );
                  })}
                </tr>
              );

              if (slotIndex === 1) rows.push(<tr key="break" className="break-row"><td colSpan={DAYS.length + 1}>10:45 – 11:00 &nbsp;|&nbsp; Break</td></tr>);
              if (slotIndex === 3) rows.push(<tr key="lunch" className="break-row"><td colSpan={DAYS.length + 1}>01:00 – 01:45 &nbsp;|&nbsp; Lunch Break</td></tr>);

              return rows;
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTeacherTable = (teacherName) => {
    const schedule = teacherSchedules[teacherName];
    const skipMap = {};

    return (
      <div className="tt-wrap">
        <table className="tt-table">
          <thead>
            <tr>
              <th>Time</th>
              {DAYS.map((d) => <th key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((timeLabel, slotIndex) => {
              const rows = [];
              rows.push(
                <tr key={`slot-${slotIndex}`}>
                  <td className="time-col">{timeLabel}</td>
                  {DAYS.map((day) => {
                    const key = `${day}-${slotIndex}`;
                    if (skipMap[key]) return null;

                    const slot = schedule[day]?.[slotIndex];
                    if (!slot) return <td key={key}><span className="cell-empty">—</span></td>;

                    const nextSlot = schedule[day]?.[slotIndex + 1];
                    const isLabDouble =
                      slot.type === "lab" &&
                      nextSlot?.type === "lab" &&
                      nextSlot.subject === slot.subject &&
                      nextSlot.division === slot.division;

                    if (isLabDouble) skipMap[`${day}-${slotIndex + 1}`] = true;

                    const roomText = Array.isArray(slot.room) ? slot.room.join(", ") : slot.room;
                    const cellClass = slot.type === "lab" ? "lab-cell" : slot.type === "theory" ? "theory-cell" : "";

                    return (
                      <td key={key} rowSpan={isLabDouble ? 2 : 1} className={cellClass}>
                        <span className="cell-subj">{slot.subject}</span>
                        <span className="cell-info">{slot.division}</span>
                        <span className="cell-info">{roomText}</span>
                      </td>
                    );
                  })}
                </tr>
              );

              if (slotIndex === 1) rows.push(<tr key="break" className="break-row"><td colSpan={DAYS.length + 1}>10:45 – 11:00 &nbsp;|&nbsp; Break</td></tr>);
              if (slotIndex === 3) rows.push(<tr key="lunch" className="break-row"><td colSpan={DAYS.length + 1}>01:00 – 01:45 &nbsp;|&nbsp; Lunch Break</td></tr>);

              return rows;
            })}
          </tbody>
        </table>
      </div>
    );
  };

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

        {selected
          ? view === "division" ? renderDivisionTable(selected) : renderTeacherTable(selected)
          : <div className="hint-box">
              {view === "division" ? "Select a division above to view its timetable." : "Select a teacher above to view their schedule."}
            </div>
        }
      </div>

      {/* AI panel */}
      <div className="ai-panel">
        <div className="ai-card">
          <div className="ai-header">AI Evaluation</div>
          <div className="ai-body">
            {loadingAI && <div className="ai-loading"><div className="spinner" /> Analyzing timetable...</div>}
            {!loadingAI && aiResult && (
              <pre className="ai-output">
                {aiResult.raw_output ? aiResult.raw_output : JSON.stringify(aiResult, null, 2)}
              </pre>
            )}
            {!loadingAI && !aiResult && <p className="ai-placeholder">AI analysis will appear here after generation.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimetableDisplay;
