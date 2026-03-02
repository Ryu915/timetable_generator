from copy import deepcopy
import random


# Models

class Subject:
    def __init__(self, id, name, type, hours_per_week):
        self.id = id
        self.name = name
        self.type = type
        self.hours_per_week = hours_per_week
        self.current_hours = 0


class Teacher:
    def __init__(self, id, name, subjects):
        self.id = id
        self.name = name
        self.subjects = subjects


# Helpers

def find_teacher(subject, teachers):
    for teacher in teachers:
        if subject.id in teacher.subjects:
            return teacher
    return None


def day_has_lab(timetable, day):
    for slot in timetable[day]:
        if slot and slot["type"] == "lab":
            return True
    return False


def find_two_consecutive_slots(day_slots):
    for i in range(len(day_slots) - 1):
        if day_slots[i] is None and day_slots[i + 1] is None:
            return i
    return None


def theory_count_on_day(timetable, day, subject_name):
    count = 0
    for slot in timetable[day]:
        if slot and slot["type"] == "theory" and slot["subject"] == subject_name:
            count += 1
    return count


# Main

def generate_timetable(data):

    base_days = data["days"]
    num_slots = data["slots_per_day"]
    divisions = data["divisions"]

    base_subjects = [
        Subject(s["id"], s["name"], s["type"], s["hours_per_week"])
        for s in data["subjects"]
    ]

    teachers = [
        Teacher(t["id"], t["name"], t["subjects"])
        for t in data["teachers"]
    ]

    # Global teacher clash tracker
    teacher_busy = {
        teacher.id: {
            day: [False] * num_slots for day in base_days
        }
        for teacher in teachers
    }

    final_timetable = {}

    # Each division scheduled independently (teachers tracked globally)
    for division in divisions:

        subjects = deepcopy(base_subjects)

        # You originally had this — keeping it unchanged
        days = base_days[:]
        random.shuffle(days)

        timetable = {
            day: [None for _ in range(num_slots)]
            for day in base_days
        }

        # Schedule LABS first
        for subject in subjects:
            if subject.type != "lab":
                continue

            teacher = find_teacher(subject, teachers)
            sessions = subject.hours_per_week // 2

            for _ in range(sessions):

                for day in days:

                    if day_has_lab(timetable, day):
                        continue

                    start_index = find_two_consecutive_slots(timetable[day])
                    if start_index is None:
                        continue

                    # Teacher clash check (both slots)
                    if (
                        teacher_busy[teacher.id][day][start_index] or
                        teacher_busy[teacher.id][day][start_index + 1]
                    ):
                        continue

                    # Place lab
                    timetable[day][start_index] = {
                        "subject": subject.name,
                        "teacher": teacher.name,
                        "type": "lab"
                    }

                    timetable[day][start_index + 1] = {
                        "subject": subject.name,
                        "teacher": teacher.name,
                        "type": "lab"
                    }

                    subject.current_hours += 2

                    # Mark teacher busy
                    teacher_busy[teacher.id][day][start_index] = True
                    teacher_busy[teacher.id][day][start_index + 1] = True

                    break

        # Schedule THEORY
        # Slot-by-slot → [slot][day]
        for i in range(num_slots):
            for day in days:

                if timetable[day][i] is not None:
                    continue

                for subject in subjects:

                    if subject.type != "theory":
                        continue

                    if subject.current_hours >= subject.hours_per_week:
                        continue

                    # Max 2 theory per day per subject
                    if theory_count_on_day(timetable, day, subject.name) >= 2:
                        continue

                    teacher = find_teacher(subject, teachers)

                    # Teacher clash check
                    if teacher_busy[teacher.id][day][i]:
                        continue

                    # Place theory
                    timetable[day][i] = {
                        "subject": subject.name,
                        "teacher": teacher.name,
                        "type": "theory"
                    }

                    subject.current_hours += 1
                    teacher_busy[teacher.id][day][i] = True

                    break  # move to next slot

        final_timetable[division] = timetable

    return final_timetable
