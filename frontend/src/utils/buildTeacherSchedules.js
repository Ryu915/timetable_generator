const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SLOT_COUNT = 6;

export function buildTeacherSchedules(result) {
  const schedules = {};

  Object.entries(result).forEach(([division, timetable]) => {
    DAYS.forEach((day) => {
      (timetable[day] || []).forEach((slot, slotIndex) => {
        if (!slot || !slot.teacher) return;
        const name = slot.teacher;
        if (!schedules[name]) {
          schedules[name] = {};
          DAYS.forEach((d) => { schedules[name][d] = Array(SLOT_COUNT).fill(null); });
        }
        if (!schedules[name][day][slotIndex]) {
          schedules[name][day][slotIndex] = { ...slot, division };
        }
      });
    });
  });

  return schedules;
}
