// ======================================
// AI DIABETES PREDICTION - SCRIPT.JS
// ======================================

document.addEventListener("DOMContentLoaded", () => {
    const weightInput = document.getElementById("weight");
    const heightInput = document.getElementById("height");
    const bmiInput = document.getElementById("bmi");

    if (weightInput && heightInput && bmiInput) {
        weightInput.addEventListener("input", calculateBMI);
        heightInput.addEventListener("input", calculateBMI);
    }

    function calculateBMI() {
        if (weightInput.value && heightInput.value) {
            let h = parseFloat(heightInput.value) / 100;
            let w = parseFloat(weightInput.value);
            if (h > 0) {
                let bmiValue = w / (h * h);
                bmiInput.value = bmiValue.toFixed(2);
            }
        }
    }
});

// Pregnancy field toggle
function togglePregnancy() {
    const gender = document.getElementById("gender");
    const pregnancyDiv = document.getElementById("pregnancyDiv");
    const pregnancy = document.getElementById("pregnancy");

    if (gender && pregnancyDiv) {
        if (gender.value === "female") {
            pregnancyDiv.style.display = "block";
        } else {
            pregnancyDiv.style.display = "none";
            if (pregnancy) pregnancy.value = 0;
        }
    }
}

// Sample Data Autofill for Quick Demo Testing
window.fillSampleData = function (type) {
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    if (type === "normal") {
        setVal("name", "Rahul Sharma");
        setVal("age", "28");
        setVal("gender", "male");
        togglePregnancy();
        setVal("weight", "65");
        setVal("height", "175");
        setVal("bmi", "21.22");
        setVal("glucose", "92");
        setVal("bloodPressure", "78");
        setVal("familyHistory", "0");
        setVal("heartDisease", "0");
        setVal("smoking", "0");
    } else if (type === "high") {
        setVal("name", "Anjali Verma");
        setVal("age", "54");
        setVal("gender", "female");
        togglePregnancy();
        setVal("pregnancy", "3");
        setVal("weight", "88");
        setVal("height", "160");
        setVal("bmi", "34.38");
        setVal("glucose", "178");
        setVal("bloodPressure", "145");
        setVal("familyHistory", "1");
        setVal("heartDisease", "1");
        setVal("smoking", "1");
    }
};

// Predict Function
function predict() {
    const nameInput = document.getElementById("name");
    const age = document.getElementById("age");
    const gender = document.getElementById("gender");
    const pregnancy = document.getElementById("pregnancy");
    const weight = document.getElementById("weight");
    const height = document.getElementById("height");
    const bmi = document.getElementById("bmi");
    const glucose = document.getElementById("glucose");
    const bloodPressure = document.getElementById("bloodPressure");
    const familyHistory = document.getElementById("familyHistory");
    const heartDisease = document.getElementById("heartDisease");
    const smoking = document.getElementById("smoking");

    if (
        !nameInput || !nameInput.value.trim() ||
        !age || !age.value ||
        !glucose || !glucose.value ||
        !bloodPressure || !bloodPressure.value ||
        !bmi || !bmi.value
    ) {
        alert("Please fill in all required health information fields.");
        return;
    }

    const requestData = {
        pregnancies: (gender && gender.value === "female" && pregnancy) ? parseInt(pregnancy.value || 0) : 0,
        glucose: parseFloat(glucose.value),
        bloodPressure: parseFloat(bloodPressure.value),
        bmi: parseFloat(bmi.value),
        age: parseInt(age.value),
        familyHistory: parseInt(familyHistory.value || 0),
        heartDisease: parseInt(heartDisease.value || 0),
        smoking: parseInt(smoking.value || 0)
    };

    // Show loading state if needed
    const btn = document.querySelector(".predict-btn");
    let originalText = "";
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculating AI Risk...';
        btn.disabled = true;
    }

    // Determine target API endpoint (use local origin if served via Flask, fallback to 127.0.0.1:5000)
    const apiEndpoint = (window.location.origin.includes("5000")) 
        ? "/predict" 
        : "http://127.0.0.1:5000/predict";

    fetch(apiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) throw new Error("Flask server error");
        return response.json();
    })
    .then(data => {
        const now = new Date();

        const prediction = {
            id: "DIA-" + Date.now(),
            name: nameInput.value.trim(),
            age: age.value,
            gender: gender.value,
            weight: weight.value,
            height: height.value,
            glucose: glucose.value,
            bloodPressure: bloodPressure.value,
            bmi: bmi.value,
            pregnancies: (gender.value === "female" && pregnancy) ? pregnancy.value : "0",
            familyHistory: familyHistory.value,
            heartDisease: heartDisease.value,
            smoking: smoking.value,
            risk: data.risk,
            level: data.level,
            color: data.color,
            recommendation: data.recommendation,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString()
        };

        // Save Current Prediction
        localStorage.setItem("patientName", prediction.name);
        localStorage.setItem("age", prediction.age);
        localStorage.setItem("gender", prediction.gender);
        localStorage.setItem("weight", prediction.weight);
        localStorage.setItem("height", prediction.height);
        localStorage.setItem("glucose", prediction.glucose);
        localStorage.setItem("bloodPressure", prediction.bloodPressure);
        localStorage.setItem("bmi", prediction.bmi);
        localStorage.setItem("pregnancies", prediction.pregnancies);
        localStorage.setItem("familyHistory", prediction.familyHistory);
        localStorage.setItem("heartDisease", prediction.heartDisease);
        localStorage.setItem("smoking", prediction.smoking);
        localStorage.setItem("risk", prediction.risk);
        localStorage.setItem("level", prediction.level);
        localStorage.setItem("color", prediction.color);
        localStorage.setItem("recommendation", prediction.recommendation);
        localStorage.setItem("predictionID", prediction.id);
        localStorage.setItem("predictionDate", prediction.date);
        localStorage.setItem("predictionTime", prediction.time);

        // Save to History
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem("history")) || [];
        } catch (e) {
            history = [];
        }
        history.unshift(prediction); // put newest at top
        localStorage.setItem("history", JSON.stringify(history));

        // Redirect to Result
        window.location.href = "result.html";
    })
    .catch(error => {
        console.error("Prediction Error:", error);
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

        // Fallback local calculation if backend is not running
        let riskScore = 15;
        if (requestData.glucose > 140) riskScore += 35;
        if (requestData.bmi > 28) riskScore += 20;
        if (requestData.bloodPressure > 130) riskScore += 15;
        if (requestData.age > 45) riskScore += 10;
        if (requestData.familyHistory === 1) riskScore += 10;

        riskScore = Math.min(98, riskScore);
        let levelText = riskScore > 60 ? "High Risk" : riskScore > 30 ? "Moderate Risk" : "Low Risk";
        let colorCode = riskScore > 60 ? "#e74c3c" : riskScore > 30 ? "#f39c12" : "#2ecc71";
        let recText = riskScore > 60 
            ? "Your diabetes risk is elevated. Consult a physician for further diagnostic evaluation."
            : "Your risk is low to moderate. Maintain balanced diet and routine activity.";

        const now = new Date();
        localStorage.setItem("patientName", nameInput.value);
        localStorage.setItem("age", age.value);
        localStorage.setItem("gender", gender.value);
        localStorage.setItem("weight", weight.value);
        localStorage.setItem("height", height.value);
        localStorage.setItem("glucose", glucose.value);
        localStorage.setItem("bloodPressure", bloodPressure.value);
        localStorage.setItem("bmi", bmi.value);
        localStorage.setItem("pregnancies", requestData.pregnancies);
        localStorage.setItem("familyHistory", familyHistory.value);
        localStorage.setItem("heartDisease", heartDisease.value);
        localStorage.setItem("smoking", smoking.value);
        localStorage.setItem("risk", riskScore);
        localStorage.setItem("level", levelText);
        localStorage.setItem("color", colorCode);
        localStorage.setItem("recommendation", recText);
        localStorage.setItem("predictionID", "DIA-" + Date.now());
        localStorage.setItem("predictionDate", now.toLocaleDateString());
        localStorage.setItem("predictionTime", now.toLocaleTimeString());

        let history = [];
        try { history = JSON.parse(localStorage.getItem("history")) || []; } catch(e) {}
        history.unshift({
            id: "DIA-" + Date.now(),
            name: nameInput.value,
            age: age.value,
            gender: gender.value,
            glucose: glucose.value,
            bloodPressure: bloodPressure.value,
            bmi: bmi.value,
            risk: riskScore,
            level: levelText,
            color: colorCode,
            recommendation: recText,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString()
        });
        localStorage.setItem("history", JSON.stringify(history));

        window.location.href = "result.html";
    });
}