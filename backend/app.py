from flask import Flask
from routes.timetable import timetable_bp

app = Flask(__name__)
app.register_blueprint(timetable_bp)

if __name__ == "__main__":
    app.run(debug=True)
