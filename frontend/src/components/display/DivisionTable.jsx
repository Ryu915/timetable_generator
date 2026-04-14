

const TIME_SLOTS = [
  "Slot 1",
  "Slot 2",
  "Slot 3",
  "Slot 4",
  "Slot 5",
  "Slot 6"
];

function DivisionTable({ division, timetable, days }) {
  const skipMap = {};

  return (
    <div className="tt-wrap">
      <table className="tt-table">
        <thead>
          <tr>
            <th>Time</th>
            {days.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {TIME_SLOTS.map((timeLabel, slotIndex) => {
            const rows = [];

            rows.push(
              <tr key={`slot-${slotIndex}`}>
                <td className="time-col">{timeLabel}</td>

                {days.map((day) => {
                  const key = `${day}-${slotIndex}`;
                  if (skipMap[key]) return null;

                  const slot = timetable[day]?.[slotIndex];

                  if (!slot) {
                    return (
                      <td key={key}>
                        <span className="cell-empty">—</span>
                      </td>
                    );
                  }

                  const nextSlot = timetable[day]?.[slotIndex + 1];

                  const isLabDouble =
                    slot.type === "lab" &&
                    nextSlot?.type === "lab" &&
                    nextSlot.subject === slot.subject &&
                    nextSlot.teacher === slot.teacher;

                  if (isLabDouble) {
                    skipMap[`${day}-${slotIndex + 1}`] = true;
                  }

                  const roomText = Array.isArray(slot.room)
                    ? slot.room.join(", ")
                    : slot.room;

                  const cellClass =
                    slot.type === "lab"
                      ? "lab-cell"
                      : slot.type === "theory"
                      ? "theory-cell"
                      : "";

                  return (
                    <td
                      key={key}
                      rowSpan={isLabDouble ? 2 : 1}
                      className={cellClass}
                    >
                      <span className="cell-subj">{slot.subject}</span>
                      <span className="cell-info">{slot.teacher}</span>
                      <span className="cell-info">{roomText}</span>
                    </td>
                  );
                })}
              </tr>
            );

            // Break after Slot 2
            if (slotIndex === 1) {
              rows.push(
                <tr key="break" className="break-row">
                  <td colSpan={days.length + 1}>Break</td>
                </tr>
              );
            }

            // Lunch after Slot 4
            if (slotIndex === 3) {
              rows.push(
                <tr key="lunch" className="break-row">
                  <td colSpan={days.length + 1}>
                    Lunch Break
                  </td>
                </tr>
              );
            }

            return rows;
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DivisionTable;