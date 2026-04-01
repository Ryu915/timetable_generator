from flask import Blueprint, request, jsonify
from services.llm_service import evaluate_timetable

ai_routes = Blueprint("ai_routes", __name__)


@ai_routes.route("/evaluate", methods=["POST"])
def evaluate():
    try:
        data = request.get_json()

        if not data or "timetable" not in data:
            return jsonify({"error": "Missing timetable"}), 400

        result = evaluate_timetable(data["timetable"])
        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "error": "Something went wrong",
            "details": str(e)
        }), 500