const TIME_SLOTS = [
  "08:45 – 09:45",
  "09:45 – 10:45",
  "11:00 – 12:00",
  "12:00 – 01:00",
  "01:45 – 02:45",
  "02:45 – 03:45",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function DivisionTable({ division, timetable }) {
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
}

export default DivisionTable;
