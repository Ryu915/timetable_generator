const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOT_COUNT = 6;

export function buildTeacherSchedules(result) {
  const schedules = {};

  Object.entries(result).forEach(([division, timetable]) => {
    DAYS.forEach((day) => {
      (timetable[day] || []).forEach((slot, slotIndex) => {
        if (!slot) return;
        
        // Handle single teacher (theory) or multiple teachers (labs)
        const teachers = slot.teacher ? [slot.teacher] : (slot.teachers || []);
        
        teachers.forEach(name => {
          if (!schedules[name]) {
            schedules[name] = {};
            DAYS.forEach((d) => { schedules[name][d] = Array(SLOT_COUNT).fill(null); });
          }
          if (!schedules[name][day][slotIndex]) {
            const specificSlot = { ...slot, division };
            if (slot.teacher_subject_map && slot.teacher_subject_map[name]) {
              specificSlot.subject = slot.teacher_subject_map[name];
            }
            schedules[name][day][slotIndex] = specificSlot;
          }
        });
      });
    });
  });

  return schedules;
}
