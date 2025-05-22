from flask import Flask, jsonify, request
import json

app = Flask(__name__)
DATA_FILE = "teachers.json"

def load_teachers():
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return [
            {"id": 1, "name": "Anna Müller", "subject": "Mathematik", "description": "Engagiert und verständnisvoll.", "ratings": []},
            {"id": 2, "name": "Lars Schmidt", "subject": "Physik", "description": "Kreativ im Unterricht.", "ratings": []}
        ]

def save_teachers(teachers):
    with open(DATA_FILE, "w") as f:
        json.dump(teachers, f, indent=2)

@app.route("/teachers", methods=["GET"])
def get_teachers():
    return jsonify(load_teachers())

@app.route("/teachers/<int:teacher_id>/rate", methods=["POST"])
def rate_teacher(teacher_id):
    teachers = load_teachers()
    data = request.get_json()

    teacher = next((t for t in teachers if t["id"] == teacher_id), None)
    if not teacher:
        return jsonify({"error": "Lehrer nicht gefunden"}), 404

    teacher["ratings"].append({
        "stars": data.get("stars"),
        "comment": data.get("comment")
    })
    save_teachers(teachers)
    return jsonify(teacher)

if __name__ == "__main__":
    app.run(debug=True)