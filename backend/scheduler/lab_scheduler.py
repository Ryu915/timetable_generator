BATCHES_PER_LAB = 4
LAB_DURATION = 2


def try_assign_lab(day, slot, division,
                   timetable,
                   resources,
                   lab_quota,
                   breaks):

    if lab_quota[division] <= 0:
        return False

    # Ensure next slot exists
    if slot + 1 >= resources.slots_per_day:
        return False

    # Check break
    if day in breaks:
        if slot in breaks[day] or (slot + 1) in breaks[day]:
            return False

    # Check timetable empty for both slots
    if timetable[day][slot][division] is not None:
        return False
    if timetable[day][slot + 1][division] is not None:
        return False

    # Find available lab rooms
    available_rooms = [
        r for r in resources.rooms
        if r["type"] == "lab"
        and resources.is_room_free(r["id"], day, slot)
        and resources.is_room_free(r["id"], day, slot + 1)
    ]

    if len(available_rooms) < BATCHES_PER_LAB:
        return False

    # Find available teachers
    available_teachers = [
        t for t in resources.teachers
        if "lab" in t["subjects"]
        and resources.is_teacher_free(t["id"], day, slot)
        and resources.is_teacher_free(t["id"], day, slot + 1)
    ]

    if len(available_teachers) < BATCHES_PER_LAB:
        return False

    selected_rooms = available_rooms[:BATCHES_PER_LAB]
    selected_teachers = available_teachers[:BATCHES_PER_LAB]

    # Assign both slots
    timetable[day][slot][division] = []
    timetable[day][slot + 1][division] = []

    for i in range(BATCHES_PER_LAB):

        room = selected_rooms[i]["id"]
        teacher = selected_teachers[i]["id"]

        resources.book_room(room, day, slot)
        resources.book_room(room, day, slot + 1)

        resources.book_teacher(teacher, day, slot)
        resources.book_teacher(teacher, day, slot + 1)

        timetable[day][slot][division].append({
            "type": "lab",
            "batch": i + 1,
            "room": room,
            "teacher": teacher
        })

        timetable[day][slot + 1][division].append({
            "type": "lab_continued",
            "batch": i + 1,
            "room": room,
            "teacher": teacher
        })

    lab_quota[division] -= 1
    return True
