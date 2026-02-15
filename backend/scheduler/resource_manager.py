class ResourceManager:

    def __init__(self, teachers, rooms, days, slots_per_day):

        self.days = days
        self.slots_per_day = slots_per_day

        self.teachers = teachers
        self.rooms = rooms

        # Busy tracking
        self.teacher_busy = {
            day: {slot: set() for slot in range(slots_per_day)}
            for day in days
        }

        self.room_busy = {
            day: {slot: set() for slot in range(slots_per_day)}
            for day in days
        }

    # ------------------ TEACHER ------------------

    def is_teacher_free(self, teacher, day, slot):
        return teacher not in self.teacher_busy[day][slot]

    def book_teacher(self, teacher, day, slot):
        self.teacher_busy[day][slot].add(teacher)

    # ------------------ ROOM ------------------

    def is_room_free(self, room, day, slot):
        return room not in self.room_busy[day][slot]

    def book_room(self, room, day, slot):
        self.room_busy[day][slot].add(room)
