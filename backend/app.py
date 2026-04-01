from flask import Flask
from flask_cors import CORS
from routes.timetable import timetable_bp
from routes.ai import ai_routes

app = Flask(__name__)

CORS(app)
# register routes AFTER CORS
app.register_blueprint(timetable_bp)
app.register_blueprint(ai_routes, url_prefix="/ai")

if __name__ == "__main__":
    app.run(debug=True)