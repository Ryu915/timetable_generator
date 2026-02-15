def try_assign_theory(day, slot, division,
                      timetable,
                      resources,
                      theory_quota,
                      breaks):

    if theory_quota[division] <= 0:
        return False

    if day in breaks and slot in breaks[day]:
        return False

    if timetable[day][slot][division] is not None:
        return False

    # Find room
    available_rooms = [
        r for r in resources.rooms
        if r["type"] == "theory"
        and resources.is_room_free(r["id"], day, slot)
    ]

    if not available_rooms:
        return False

    # Find teacher
    available_teachers = [
        t for t in resources.teachers
        if "theory" in t["subjects"]
        and resources.is_teacher_free(t["id"], day, slot)
    ]

    if not available_teachers:
        return False

    room = available_rooms[0]["id"]
    teacher = available_teachers[0]["id"]

    resources.book_room(room, day, slot)
    resources.book_teacher(teacher, day, slot)

    timetable[day][slot][division] = {
        "type": "theory",
        "room": room,
        "teacher": teacher
    }

    theory_quota[division] -= 1
    return True
