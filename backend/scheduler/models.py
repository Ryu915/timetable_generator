class Subject:
    def __init__(self, id, name, type, hours_per_week):
        self.id = id
        self.name = name
        self.type = type  # "theory" or "lab"
        self.hours_per_week = hours_per_week


class Teacher:
    def __init__(self, id, name, subjects):
        self.id = id
        self.name = name
        self.subjects = subjects  # list of subject ids
