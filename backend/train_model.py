import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# ==========================
# Load Dataset
# ==========================

df = pd.read_csv("../dataset/diabetes.csv")

print("Dataset Loaded Successfully")
print(df.head())

# ==========================
# Features & Target
# ==========================

X = df[[
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "BMI",
    "Age",
    "FamilyHistory",
    "HeartDisease",
    "Smoking"
]]

y = df["Outcome"]

# ==========================
# Train Test Split
# ==========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# ==========================
# Train Model
# ==========================

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42
)

model.fit(X_train, y_train)

# ==========================
# Test Accuracy
# ==========================

y_pred = model.predict(X_test)

print("\nAccuracy:",
      round(accuracy_score(y_test, y_pred) * 100, 2), "%")

print("\nClassification Report\n")
print(classification_report(y_test, y_pred))

# ==========================
# Save Model
# ==========================

joblib.dump(model, "model.pkl")

print("\nModel Saved Successfully!")