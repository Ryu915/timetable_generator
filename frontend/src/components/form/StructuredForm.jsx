import { useState } from "react";

const DAYS_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const emptySubject = () => ({ id: Date.now() + Math.random(), name: "", type: "theory", hours_per_week: 2 });
const emptyTeacher = () => ({ id: Date.now() + Math.random(), name: "", subjects: "" });

function StructuredForm({ onSubmit, loading }) {
  const [days, setDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [slotsPerDay, setSlotsPerDay] = useState(6);
  const [divisions, setDivisions] = useState("TE-I, TE-II, TE-III, TE-IV");
  const [theoryRooms, setTheoryRooms] = useState(3);
  const [labRooms, setLabRooms] = useState(8);
  const [subjects, setSubjects] = useState([emptySubject()]);
  const [teachers, setTeachers] = useState([emptyTeacher()]);

  const toggleDay = (day) =>
    setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);

  const updateSubject = (id, field, value) =>
    setSubjects((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));

  const updateTeacher = (id, field, value) =>
    setTeachers((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t));

  const handleSubmit = (e) => {
    e.preventDefault();

    const divList = divisions.split(",").map((d, i) => ({ id: i + 1, name: d.trim() })).filter((d) => d.name);
    const subjectList = subjects
      .filter((s) => s.name.trim())
      .map((s, i) => ({ id: i + 1, name: s.name.trim(), type: s.type, hours_per_week: Number(s.hours_per_week) }));
    const teacherList = teachers
      .filter((t) => t.name.trim())
      .map((t, i) => ({
        id: i + 1,
        name: t.name.trim(),
        subjects: t.subjects.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n) && n > 0),
      }));

    onSubmit({
      days,
      slots_per_day: Number(slotsPerDay),
      divisions: divList,
      theory_rooms: Number(theoryRooms),
      lab_rooms: Number(labRooms),
      subjects: subjectList,
      teachers: teacherList,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="structured-form">

      <div className="form-grid">
        <div className="form-field">
          <label>Divisions <span className="hint">(comma separated)</span></label>
          <input value={divisions} onChange={(e) => setDivisions(e.target.value)} placeholder="TE-I, TE-II" />
        </div>
        <div className="form-field">
          <label>Slots per Day</label>
          <input type="number" min="1" max="12" value={slotsPerDay} onChange={(e) => setSlotsPerDay(e.target.value)} />
        </div>
        <div className="form-field">
          <label>Theory Rooms</label>
          <input type="number" min="1" value={theoryRooms} onChange={(e) => setTheoryRooms(e.target.value)} />
        </div>
        <div className="form-field">
          <label>Lab Rooms</label>
          <input type="number" min="1" value={labRooms} onChange={(e) => setLabRooms(e.target.value)} />
        </div>
      </div>

      <div className="form-field">
        <label>Days</label>
        <div className="day-chips">
          {DAYS_OPTIONS.map((d) => (
            <span key={d} className={`day-chip ${days.includes(d) ? "active" : ""}`} onClick={() => toggleDay(d)}>
              {d.slice(0, 3)}
            </span>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label>Subjects</label>
        <div className="dynamic-list">
          {subjects.map((s) => (
            <div key={s.id} className="dynamic-row">
              <input placeholder="Subject name" value={s.name} onChange={(e) => updateSubject(s.id, "name", e.target.value)} />
              <select value={s.type} onChange={(e) => updateSubject(s.id, "type", e.target.value)}>
                <option value="theory">Theory</option>
                <option value="lab">Lab</option>
                <option value="other">Other</option>
              </select>
              <input type="number" min="1" max="10" placeholder="Hrs/week" value={s.hours_per_week}
                onChange={(e) => updateSubject(s.id, "hours_per_week", e.target.value)} style={{ width: "90px" }} />
              <button type="button" className="btn-remove" onClick={() => setSubjects((prev) => prev.filter((x) => x.id !== s.id))}>✕</button>
            </div>
          ))}
          <button type="button" className="btn-add" onClick={() => setSubjects((prev) => [...prev, emptySubject()])}>+ Add Subject</button>
        </div>
      </div>

      <div className="form-field">
        <label>Teachers</label>
        <p className="hint" style={{ marginBottom: "0.5rem" }}>Subject IDs match the order of subjects above (1, 2, 3...)</p>
        <div className="dynamic-list">
          {teachers.map((t) => (
            <div key={t.id} className="dynamic-row">
              <input placeholder="Teacher name" value={t.name} onChange={(e) => updateTeacher(t.id, "name", e.target.value)} style={{ flex: 2 }} />
              <input placeholder="Subject IDs (e.g. 1, 3)" value={t.subjects}
                onChange={(e) => updateTeacher(t.id, "subjects", e.target.value)} style={{ flex: 1 }} />
              <button type="button" className="btn-remove" onClick={() => setTeachers((prev) => prev.filter((x) => x.id !== t.id))}>✕</button>
            </div>
          ))}
          <button type="button" className="btn-add" onClick={() => setTeachers((prev) => [...prev, emptyTeacher()])}>+ Add Teacher</button>
        </div>
      </div>

      <button className="btn-generate" type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate Timetable"}
      </button>
    </form>
  );
}

export default StructuredForm;
