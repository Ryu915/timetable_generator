function TimetableDisplay({ result }) {
  if (!result) return null;

  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = ["Slot 1", "Slot 2", "Slot 3", "Slot 4", "Slot 5", "Slot 6"];

  return (
    <div>
      <h2>Generated Timetable</h2>

      {Object.entries(result).map(([division, timetable]) => {
        const skipMap = {};

        return (
          <div key={division} style={{ marginBottom: "50px" }}>
            <h3>{division}</h3>

            <table
              border="1"
              cellPadding="10"
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <thead>
                <tr>
                  <th>Time</th>
                  {daysOrder.map((day) => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {timeSlots.map((slotName, slotIndex) => {
                  const rows = [];

                  // -------- SLOT ROW --------
                  rows.push(
                    <tr key={`slot-${slotIndex}`}>
                      <td><strong>{slotName}</strong></td>

                      {daysOrder.map((day) => {
                        const key = `${day}-${slotIndex}`;
                        if (skipMap[key]) return null;

                        const slot = timetable[day]?.[slotIndex];
                        if (!slot) return <td key={key}>-</td>;

                        const nextSlot = timetable[day]?.[slotIndex + 1];

                        const isLabDouble =
                          slot.type === "lab" &&
                          nextSlot &&
                          nextSlot.type === "lab" &&
                          nextSlot.subject === slot.subject &&
                          nextSlot.teacher === slot.teacher;

                        if (isLabDouble) {
                          skipMap[`${day}-${slotIndex + 1}`] = true;
                        }

                        const roomText = Array.isArray(slot.room)
                          ? slot.room.join(", ")
                          : slot.room;

                        return (
                          <td
                            key={key}
                            rowSpan={isLabDouble ? 2 : 1}
                            style={{
                              verticalAlign: "middle",
                              textAlign: "center"
                            }}
                          >
                            <div><strong>{slot.subject}</strong></div>
                            <div>{slot.teacher}</div>
                            <div>{roomText}</div>
                          </td>
                        );
                      })}
                    </tr>
                  );

                  // -------- BREAK ROW (after every 2 slots) --------
                  if ((slotIndex + 1) % 2 === 0 && slotIndex !== timeSlots.length - 1) {
                    rows.push(
                      <tr key={`break-${slotIndex}`}>
                        <td
                          colSpan={daysOrder.length + 1}
                          style={{
                            textAlign: "center",
                            fontWeight: "bold"
                          }}
                        >
                          BREAK
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
      })}
    </div>
  );
}

export default TimetableDisplay;