from flask import Blueprint, request, jsonify
from scheduler.engine import generate_timetable

timetable_bp = Blueprint("timetable", __name__)

@timetable_bp.route("/generate", methods=["POST"])
def generate():
    data = request.json
    result = generate_timetable(data)
    return jsonify(result)
