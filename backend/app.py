from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(
    __name__,
    static_folder="../frontend",
    static_url_path=""
)

CORS(app)

# ===============================
# Load Model
# ===============================

model = joblib.load("model.pkl")

# ===============================
# Pages
# ===============================

@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/about")
def about():
    return send_from_directory(app.static_folder, "about.html")


@app.route("/predict-page")
def predict_page():
    return send_from_directory(app.static_folder, "predict.html")


@app.route("/result")
def result():
    return send_from_directory(app.static_folder, "result.html")


@app.route("/history")
def history():
    return send_from_directory(app.static_folder, "history.html")


@app.route("/analytics")
def analytics():
    return send_from_directory(app.static_folder, "analytics.html")


@app.route("/diet")
def diet():
    return send_from_directory(app.static_folder, "diet.html")


# ===============================
# Prediction API
# ===============================

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    pregnancies = int(data["pregnancies"])
    glucose = float(data["glucose"])
    blood_pressure = float(data["bloodPressure"])
    bmi = float(data["bmi"])
    age = int(data["age"])
    family_history = int(data["familyHistory"])
    heart_disease = int(data["heartDisease"])
    smoking = int(data["smoking"])

    features = np.array([[
        pregnancies,
        glucose,
        blood_pressure,
        bmi,
        age,
        family_history,
        heart_disease,
        smoking
    ]])

    probability = model.predict_proba(features)[0][1]
    risk = round(probability * 100, 2)

    # ===============================
    # Risk Classification
    # ===============================

    if risk <= 30:

        level = "Low Risk"
        color = "#2ecc71"

        recommendation = (
            "Your diabetes risk is currently low. "
            "Maintain a balanced diet, exercise regularly, "
            "stay hydrated and continue routine health checkups."
        )

    elif risk <= 60:

        level = "Moderate Risk"
        color = "#f39c12"

        recommendation = (
            "Your diabetes risk is moderate. "
            "Reduce sugar intake, maintain a healthy weight, "
            "exercise at least 30 minutes daily and monitor your blood glucose regularly."
        )

    else:

        level = "High Risk"
        color = "#e74c3c"

        recommendation = (
            "Your diabetes risk is high. "
            "Please consult a qualified healthcare professional for further evaluation. "
            "A balanced diet, regular physical activity and timely medical advice are recommended."
        )

    return jsonify({

        "risk": risk,
        "level": level,
        "color": color,
        "recommendation": recommendation

    })


# ===============================
# Run Flask
# ===============================

if __name__ == "__main__":

    app.run(debug=True)