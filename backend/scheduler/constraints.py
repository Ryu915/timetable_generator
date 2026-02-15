def is_break(day, slot, breaks):
    if day not in breaks:
        return False
    return slot in breaks[day]
