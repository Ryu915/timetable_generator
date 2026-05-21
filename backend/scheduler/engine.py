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

def find_teacher(subject, teachers, teacher_busy=None, teacher_load=None, day=None, slots=None):
    candidates = [t for t in teachers if subject.id in t.subjects]

    return select_best_teacher(candidates, teacher_busy, teacher_load, day, slots)

def select_best_teacher(candidates, teacher_busy, teacher_load, day, slots):
    if not candidates:
        return None

    if teacher_busy is None or teacher_load is None or day is None or slots is None:
        candidates_copy = list(candidates)
        random.shuffle(candidates_copy)
        return candidates_copy[0]

    # Filter available teachers
    available = []
    for t in candidates:
        if all(not teacher_busy[t.id][day][slot] for slot in slots):
            available.append(t)

    if not available:
        return None

    random.shuffle(available)
    # Choose least loaded teacher
    return min(available, key=lambda t: teacher_load[t.id])


def lab_count_on_day(timetable, day):
    count = 0
    for i in range(0, len(timetable[day]), 2):
        if i + 1 < len(timetable[day]):
            if timetable[day][i] and timetable[day][i]["type"] == "lab":
                count += 1
    return count


# for labs
def find_all_consecutive_slots(day_slots):
    indices = []
    for i in range(0, len(day_slots), 2): 
        if i + 1 < len(day_slots):
            if day_slots[i] is None and day_slots[i + 1] is None:
                indices.append(i)
    return indices


def theory_count_on_day(timetable, day, subject_name):
    count = 0
    for slot in timetable[day]:
        if slot and slot["type"] == "theory" and slot["subject"] == subject_name:
            count += 1
    return count

def get_subject_year(subject_id):
    return subject_id // 100

def getDivisionYear(div_id):
    return div_id // 100

def get_teachers_for_subject(subject, teachers):
    return [t for t in teachers if subject.id in t.subjects]

def calculate_teacher_pressure(data, base_subjects, teachers, unimportant_subjects):
    """
    Calculate an estimate of the hours each teacher is 'committed' to across all subjects.
    Used to initialize teacher_load so that specialized teachers are not overloaded with common subjects.
    """
    pressure = {t.id: 0.0 for t in teachers}
    divisions = data["divisions"]
    for division in divisions:
        div_year = getDivisionYear(division["id"])
        for sub in base_subjects:
            if get_subject_year(sub.id) == div_year:
                candidates = [t for t in teachers if sub.id in t.subjects]
                if candidates:
              
                    multiplier = 2 if sub.type == "lab" else 1
                    share = (sub.hours_per_week * multiplier) / len(candidates)
                    for t in candidates:
                        pressure[t.id] += share
    return pressure

def is_not_consecutive_same_day(timetable, day, slot_idx, subject_name):
    # previous slot
    if slot_idx > 0:
        prev = timetable[day][slot_idx - 1]
        if prev:
            if ("subject" in prev and prev["subject"] == subject_name) or \
               ("subjects" in prev and subject_name in prev["subjects"]):
                return False

    # next slot
    if slot_idx < len(timetable[day]) - 1:
        nxt = timetable[day][slot_idx + 1]
        if nxt:
            if ("subject" in nxt and nxt["subject"] == subject_name) or \
               ("subjects" in nxt and subject_name in nxt["subjects"]):
                return False

    return True

def is_not_consecutive_days(timetable, base_days, day_idx, subject_name):
    if day_idx > 0:
        prev_day = base_days[day_idx - 1]
        for slot in timetable[prev_day]:
            if slot:
                if ("subject" in slot and slot["subject"] == subject_name) or \
                   ("subjects" in slot and subject_name in slot["subjects"]):
                    return False
    return True

def is_not_same_day_duplicate(timetable, day, subject_name):
    for slot in timetable[day]:
        if not slot:
            continue

        # theory/unimportant
        if "subject" in slot:
            if slot["subject"] == subject_name:
                return False

        # lab (multiple subjects)
        elif "subjects" in slot:
            if subject_name in slot["subjects"]:
                return False

    return True

# Main

def generate_timetable(data):

    base_days = data["days"]
    num_slots = data["slots_per_day"]
    divisions = data["divisions"]

    # for rooms
    total_theory_rooms = data["theory_rooms"]
    total_lab_rooms = data["lab_rooms"]

    theory_rooms = [f"T{i+1}" for i in range(total_theory_rooms)]
    lab_rooms = [f"Lab{i+1}" for i in range(total_lab_rooms)]

    theory_room_busy = {
        day: {i: set() for i in range(num_slots)}
        for day in base_days
    }

    lab_room_busy = {
        day: {i: set() for i in range(num_slots)}
        for day in base_days
    }

    base_subjects = [
        Subject(s["id"], s["name"], s["type"], s["hours_per_week"])
        for s in data["subjects"]
    ]

    teachers = [
        Teacher(t["id"], t["name"], t["subjects"])
        for t in data["teachers"]
    ]

    unimportant_subjects = [
        s["id"] 
        for s in data["unimportant_subjects"]
    ]

    # Global teacher pressure bias
    teacher_pressure = calculate_teacher_pressure(data, base_subjects, teachers, unimportant_subjects)

    teacher_busy = {
        teacher.id: {
            day: [False] * num_slots for day in base_days
        }
        for teacher in teachers
    }

    teacher_load = {
        teacher.id: teacher_pressure[teacher.id] for teacher in teachers
    }

    div_states = {
        div["id"]: {
            "name": div["name"],
            "timetable": {day: [None for _ in range(num_slots)] for day in base_days},
            "subjects": [deepcopy(s) for s in base_subjects if get_subject_year(s.id) == getDivisionYear(div["id"])],
            "days": random.sample(base_days, len(base_days)),
            "lab_rotation": {} 
        }
        for div in divisions
    }

    shuffled_div_ids = [div["id"] for div in divisions]
    random.shuffle(shuffled_div_ids)

    for div_id in shuffled_div_ids:
        state = div_states[div_id]
        timetable = state["timetable"]
        subjects = state["subjects"]
        days = state["days"]

        eligible_lab_subjects = [
            s for s in subjects
            if s.type == "lab"
            and s.id not in unimportant_subjects
        ]

        # Create pairs
        lab_pairs = []
        for i in range(len(eligible_lab_subjects)):
            for j in range(i + 1, len(eligible_lab_subjects)):
                lab_pairs.append((eligible_lab_subjects[i], eligible_lab_subjects[j]))

        random.shuffle(lab_pairs)
        
        for (sub1, sub2) in lab_pairs:
            sessions = min(
                (sub1.hours_per_week * 2 - sub1.current_hours) // 2,
                (sub2.hours_per_week * 2 - sub2.current_hours) // 2
            )

            for _ in range(sessions):
                placed = False
                
                pair_key = tuple(sorted([sub1.id, sub2.id]))
                rotate = state["lab_rotation"].get(pair_key, False)
                s1, s2 = (sub2, sub1) if rotate else (sub1, sub2)

                for pass_idx in range(2):
                    for day_idx, day in enumerate(days):
                        if lab_count_on_day(timetable, day) >= 3:
                            continue
                        
                        if not is_not_same_day_duplicate(timetable, day, sub1.name): continue
                        if not is_not_same_day_duplicate(timetable, day, sub2.name): continue
                        if pass_idx == 0:
                            if not is_not_consecutive_days(timetable, days, day_idx, sub1.name): continue
                            if not is_not_consecutive_days(timetable, days, day_idx, sub2.name): continue

                        start_indices = find_all_consecutive_slots(timetable[day])
                        for start_index in start_indices:
                            slots = [start_index, start_index + 1]

                            t1_candidates = [t for t in teachers if s1.id in t.subjects and all(not teacher_busy[t.id][day][s] for s in slots)]
                            t2_candidates = [t for t in teachers if s2.id in t.subjects and all(not teacher_busy[t.id][day][s] for s in slots)]

                            if len(t1_candidates) < 2 or len(t2_candidates) < 2:
                                continue

                            random.shuffle(t1_candidates)
                            t1_candidates.sort(key=lambda t: teacher_load[t.id])
                            random.shuffle(t2_candidates)
                            t2_candidates.sort(key=lambda t: teacher_load[t.id])

                            selected_t1, selected_t2 = t1_candidates[:2], t2_candidates[:2]
                            all_ts = selected_t1 + selected_t2
                            if len(set(t.id for t in all_ts)) < 4:
                                continue

                            free_lab_rooms = [r for r in lab_rooms if r not in lab_room_busy[day][start_index] and r not in lab_room_busy[day][start_index + 1]]
                            if len(free_lab_rooms) < 4:
                                continue

                            assigned_rooms = free_lab_rooms[:4]
                            for r in assigned_rooms:
                                lab_room_busy[day][start_index].add(r)
                                lab_room_busy[day][start_index + 1].add(r)

                            # Place lab
                            ts_map = {t.name: s1.name for t in selected_t1}
                            ts_map.update({t.name: s2.name for t in selected_t2})

                            for s_idx in slots:
                                timetable[day][s_idx] = {
                                    "subjects": [s1.name, s2.name],
                                    "teachers": [t.name for t in all_ts],
                                    "teacher_subject_map": ts_map,
                                    "type": "lab",
                                    "room": assigned_rooms
                                }
                            
                            sub1.current_hours += 2 
                            sub2.current_hours += 2
                            for t in all_ts:
                                teacher_busy[t.id][day][start_index] = True
                                teacher_busy[t.id][day][start_index + 1] = True
                                teacher_load[t.id] += 2
                            
                            state["lab_rotation"][pair_key] = not rotate
                            
                            placed = True
                            break
                        if placed: break
                    if placed: break

    for div_id in shuffled_div_ids:
        state = div_states[div_id]
        timetable = state["timetable"]
        subjects = state["subjects"]
        days = state["days"]

        leftover_labs = [s for s in subjects if s.type == "lab" and s.id not in unimportant_subjects and s.current_hours < s.hours_per_week]
        random.shuffle(leftover_labs)

        for subject in leftover_labs:
            sessions = (subject.hours_per_week * 2 - subject.current_hours) // 2
            for _ in range(sessions):
                placed = False
                for pass_idx in range(2):
                    for day_idx, day in enumerate(days):
                        if lab_count_on_day(timetable, day) >= 3:
                            continue

                        
                        if not is_not_same_day_duplicate(timetable, day, subject.name): continue
                        if pass_idx == 0:
                            if not is_not_consecutive_days(timetable, days, day_idx, subject.name): continue

                        start_indices = find_all_consecutive_slots(timetable[day])
                        for start_index in start_indices:
                            slots = [start_index, start_index + 1]
                            
                            t_candidates = [t for t in teachers if subject.id in t.subjects and all(not teacher_busy[t.id][day][s] for s in slots)]
                            if len(t_candidates) < 2:
                                continue
                            
                            random.shuffle(t_candidates)
                            t_candidates.sort(key=lambda t: teacher_load[t.id])
                            selected_ts = t_candidates[:2]

                            free_lab_rooms = [r for r in lab_rooms if r not in lab_room_busy[day][start_index] and r not in lab_room_busy[day][start_index + 1]]
                            if len(free_lab_rooms) < 2:
                                continue
                            
                            assigned_rooms = free_lab_rooms[:2]
                            for r in assigned_rooms:
                                lab_room_busy[day][start_index].add(r)
                                lab_room_busy[day][start_index + 1].add(r)

                            for s_idx in slots:
                                timetable[day][s_idx] = {
                                    "subject": subject.name,
                                    "teachers": [t.name for t in selected_ts],
                                    "type": "lab",
                                    "room": assigned_rooms
                                }
                            subject.current_hours += 2
                            for t in selected_ts:
                                teacher_busy[t.id][day][start_index] = True
                                teacher_busy[t.id][day][start_index + 1] = True
                                teacher_load[t.id] += 2
                            placed = True
                            break
                        if placed: break
                    if placed: break

    for i in range(num_slots):
        for day in base_days:
            shuffled_div_ids = [div["id"] for div in divisions]
            random.shuffle(shuffled_div_ids)
            shuffled_div_ids.sort(key=lambda d_id: sum(s.current_hours for s in div_states[d_id]["subjects"] if s.type == "theory" and s.id not in unimportant_subjects))

            for div_id in shuffled_div_ids:
                state = div_states[div_id]
                timetable = state["timetable"]
                if timetable[day][i] is not None:
                    continue

                subjects = state["subjects"]
                shuffled_theory = [s for s in subjects if s.type == "theory" and s.id not in unimportant_subjects]
                random.shuffle(shuffled_theory)
                shuffled_theory.sort(key=lambda s: not is_not_consecutive_same_day(timetable, day, i, s.name))

                for subject in shuffled_theory:
                    if subject.current_hours >= subject.hours_per_week:
                        continue
                    if theory_count_on_day(timetable, day, subject.name) >= 2:
                        continue
                    
                    teacher = find_teacher(subject, teachers, teacher_busy, teacher_load, day, [i])
                    if not teacher or teacher_busy[teacher.id][day][i]:
                        continue
                    
                    free_rooms = [r for r in theory_rooms if r not in theory_room_busy[day][i]]
                    if not free_rooms:
                        continue

                    assigned_room = free_rooms[0]
                    theory_room_busy[day][i].add(assigned_room)

                    timetable[day][i] = {
                        "subject": subject.name,
                        "teacher": teacher.name,
                        "type": "theory",
                        "room": assigned_room
                    }
                    teacher_load[teacher.id] += 1
                    subject.current_hours += 1
                    teacher_busy[teacher.id][day][i] = True
                    break

    shuffled_div_ids = [div["id"] for div in divisions]
    random.shuffle(shuffled_div_ids)

    for div_id in shuffled_div_ids:
        state = div_states[div_id]
        timetable = state["timetable"]
        subjects = state["subjects"]
        days = state["days"]

        unimportant_labs = [s for s in subjects if s.type == "lab" and s.id in unimportant_subjects]
        random.shuffle(unimportant_labs)

        for subject in unimportant_labs:
            sessions = (subject.hours_per_week * 2 - subject.current_hours) // 2
            for _ in range(sessions):
                placed = False
                for pass_idx in range(2):
                    for day_idx, day in enumerate(days):
                        if lab_count_on_day(timetable, day) >= 3:
                            continue

                        
                        if not is_not_same_day_duplicate(timetable, day, subject.name): continue
                        if pass_idx == 0:
                            if not is_not_consecutive_days(timetable, days, day_idx, subject.name): continue

                        start_indices = find_all_consecutive_slots(timetable[day])
                        for start_index in start_indices:
                            slots = [start_index, start_index + 1]
                            t_candidates = [t for t in teachers if subject.id in t.subjects and all(not teacher_busy[t.id][day][s] for s in slots)]
                            if len(t_candidates) < 2:
                                continue
                            
                            random.shuffle(t_candidates)
                            t_candidates.sort(key=lambda t: teacher_load[t.id])
                            selected_ts = t_candidates[:2]
                            
                            free_lab_rooms = [r for r in lab_rooms if r not in lab_room_busy[day][start_index] and r not in lab_room_busy[day][start_index + 1]]
                            if len(free_lab_rooms) < 2:
                                continue
                            
                            assigned_rooms = free_lab_rooms[:2]
                            for r in assigned_rooms:
                                lab_room_busy[day][start_index].add(r)
                                lab_room_busy[day][start_index + 1].add(r)

                            for s_idx in slots:
                                timetable[day][s_idx] = {
                                    "subject": subject.name,
                                    "teachers": [t.name for t in selected_ts],
                                    "type": "lab",
                                    "room": assigned_rooms
                                }
                            subject.current_hours += 2
                            for t in selected_ts:
                                teacher_busy[t.id][day][start_index] = True
                                teacher_busy[t.id][day][start_index + 1] = True
                                teacher_load[t.id] += 2
                            placed = True
                            break
                        if placed: break
                    if placed: break

    for day_idx, day in enumerate(base_days):
        for i in range(num_slots):
            shuffled_div_ids = [div["id"] for div in divisions]
            random.shuffle(shuffled_div_ids)

            for div_id in shuffled_div_ids:
                state = div_states[div_id]
                timetable = state["timetable"]
                if timetable[day][i] is not None:
                    continue

                subjects = state["subjects"]
                unimportant_theory = [s for s in subjects if s.type == "theory" and s.id in unimportant_subjects]
                random.shuffle(unimportant_theory)
                unimportant_theory.sort(key=lambda s: not is_not_consecutive_same_day(timetable, day, i, s.name))

                for subject in unimportant_theory:
                    if subject.current_hours >= subject.hours_per_week:
                        continue
                    if not is_not_consecutive_days(timetable, base_days, day_idx, subject.name):
                        continue
                    if not is_not_same_day_duplicate(timetable, day, subject.name):
                        continue
                    
                    teacher = find_teacher(subject, teachers, teacher_busy, teacher_load, day, [i])
                    if not teacher or teacher_busy[teacher.id][day][i]:
                        continue
                    
                    free_rooms = [r for r in theory_rooms if r not in theory_room_busy[day][i]]
                    if not free_rooms:
                        continue

                    assigned_room = free_rooms[0]
                    theory_room_busy[day][i].add(assigned_room)

                    timetable[day][i] = {
                        "subject": subject.name,
                        "teacher": teacher.name,
                        "type": "unimportant",
                        "room": assigned_room
                    }
                    subject.current_hours += 1
                    teacher_busy[teacher.id][day][i] = True
                    teacher_load[teacher.id] += 1
                    break

    final_timetables = {}
    for div_id, state in div_states.items():
        final_timetables[state["name"]] = state["timetable"]

    return final_timetables