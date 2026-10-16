// ======================================
// HEALTHCARE AI - RESULT & REPORT SCRIPT
// result.js
// ======================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Fetch Patient Data from LocalStorage
    const patientName = localStorage.getItem("patientName") || "Patient";
    const patientAge = localStorage.getItem("age") || "-";
    const patientGender = localStorage.getItem("gender") || "-";
    const patientBMI = parseFloat(localStorage.getItem("bmi")) || 0;
    const patientGlucose = parseFloat(localStorage.getItem("glucose")) || 0;
    const patientBP = parseFloat(localStorage.getItem("bloodPressure")) || 0;
    const predictionID = localStorage.getItem("predictionID") || ("DIA-" + Date.now());
    const predictionDate = (localStorage.getItem("predictionDate") || new Date().toLocaleDateString()) +
        " " + (localStorage.getItem("predictionTime") || new Date().toLocaleTimeString());

    const risk = parseFloat(localStorage.getItem("risk")) || 0;
    const level = localStorage.getItem("level") || "Low Risk";
    const color = localStorage.getItem("color") || "#2ecc71";
    const recommendation = localStorage.getItem("recommendation") || "Maintain routine health checkups and balanced lifestyle.";

    // 2. Fill Patient Information safely
    const setElemText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    setElemText("patientName", patientName);
    setElemText("patientAge", patientAge + " yrs");
    setElemText("patientGender", patientGender.charAt(0).toUpperCase() + patientGender.slice(1));
    setElemText("patientBMI", patientBMI ? patientBMI.toFixed(2) : "-");
    setElemText("patientGlucose", patientGlucose ? patientGlucose + " mg/dL" : "-");
    setElemText("patientBP", patientBP ? patientBP + " mmHg" : "-");
    setElemText("predictionID", predictionID);
    setElemText("predictionDate", predictionDate);

    // 3. BMI Category
    let bmiCategory = "Normal";
    if (patientBMI < 18.5) bmiCategory = "Underweight";
    else if (patientBMI < 25) bmiCategory = "Normal";
    else if (patientBMI < 30) bmiCategory = "Overweight";
    else if (patientBMI >= 30) bmiCategory = "Obese";

    setElemText("bmiCategory", bmiCategory);

    // 4. Animated Risk Circle & Meter
    const circle = document.getElementById("riskCircle");
    const riskLevel = document.getElementById("riskLevel");

    if (riskLevel) {
        riskLevel.innerText = level;
        riskLevel.style.color = color;
    }

    let currentRisk = 0;
    if (circle) {
        const targetRisk = Math.min(100, Math.max(0, Math.round(risk)));
        const animation = setInterval(() => {
            if (currentRisk >= targetRisk) {
                clearInterval(animation);
                circle.innerHTML = `<span>${targetRisk}%</span><small>Risk</small>`;
            } else {
                currentRisk++;
                circle.innerHTML = `<span>${currentRisk}%</span><small>Risk</small>`;
                // Standard conic gradient for browser UI
                circle.style.background = `conic-gradient(${color} ${currentRisk * 3.6}deg, #e2e8f0 ${currentRisk * 3.6}deg)`;
            }
        }, 15);
    }

    // 5. Health Score
    const healthScoreVal = Math.max(0, Math.min(100, Math.round(100 - risk)));
    setElemText("healthScore", healthScoreVal + " / 100");

    // 6. Recommendation
    const recElem = document.getElementById("recommendation");
    if (recElem) {
        recElem.innerHTML = `<b>Medical Advice Summary:</b><br>${recommendation}`;
    }

    // 7. Why this Prediction (Risk Factors)
    const riskFactors = document.getElementById("riskFactors");
    if (riskFactors) {
        riskFactors.innerHTML = "";

        if (patientGlucose >= 140) {
            riskFactors.innerHTML += "<li>🩸 <b>High Glucose Level:</b> Glucose level is 140 mg/dL or higher.</li>";
        }
        if (patientBP >= 140) {
            riskFactors.innerHTML += "<li>❤️ <b>High Blood Pressure:</b> Blood pressure is 140 mmHg or higher.</li>";
        }
        if (patientBMI >= 25) {
            riskFactors.innerHTML += `<li>⚖️ <b>High BMI (${patientBMI.toFixed(1)}):</b> Body Mass Index indicates ${bmiCategory.toLowerCase()} weight.</li>`;
        }
        if (parseInt(patientAge) >= 45) {
            riskFactors.innerHTML += "<li>👴 <b>Age Factor:</b> Age 45 years or older increases risk.</li>";
        }
        if (localStorage.getItem("familyHistory") === "1") {
            riskFactors.innerHTML += "<li>👨‍👩‍👧 <b>Family History:</b> Positive family history of diabetes recorded.</li>";
        }
        if (localStorage.getItem("heartDisease") === "1") {
            riskFactors.innerHTML += "<li>💔 <b>Heart Disease:</b> History of cardiovascular condition.</li>";
        }
        if (localStorage.getItem("smoking") === "1") {
            riskFactors.innerHTML += "<li>🚬 <b>Smoking Habit:</b> Smoking increases metabolic health risk.</li>";
        }

        if (riskFactors.innerHTML === "") {
            riskFactors.innerHTML = "<li>✅ <b>Optimal Health Indicators:</b> No major diabetes risk factors detected.</li>";
        }
    }

    // Populate PDF Template Elements
    setElemText("pdfName", patientName);
    setElemText("pdfID", predictionID);
    setElemText("pdfAgeGender", `${patientAge} yrs / ${patientGender.charAt(0).toUpperCase() + patientGender.slice(1)}`);
    setElemText("pdfDate", predictionDate);
    setElemText("pdfReportDate", `Date: ${predictionDate}`);
    setElemText("pdfGlucose", patientGlucose ? `${patientGlucose} mg/dL` : "-");
    setElemText("pdfBMI", patientBMI ? `${patientBMI.toFixed(2)} (${bmiCategory})` : "-");
    setElemText("pdfBP", patientBP ? `${patientBP} mmHg` : "-");

    const famHist = localStorage.getItem("familyHistory") === "1" ? "Yes (Positive)" : "No (Negative)";
    const heartDis = localStorage.getItem("heartDisease") === "1" ? "Yes (Present)" : "No (None)";
    const smokHab = localStorage.getItem("smoking") === "1" ? "Yes (Active)" : "No (Non-smoker)";

    setElemText("pdfFamily", famHist);
    setElemText("pdfHeart", heartDis);
    setElemText("pdfSmoking", smokHab);

    const pdfRiskVal = document.getElementById("pdfRiskVal");
    if (pdfRiskVal) {
        pdfRiskVal.innerText = `${Math.round(risk)}%`;
        pdfRiskVal.style.color = color;
    }

    const pdfLevelBadge = document.getElementById("pdfLevelBadge");
    if (pdfLevelBadge) {
        pdfLevelBadge.innerText = level;
        pdfLevelBadge.style.background = color;
    }

    const pdfRiskBox = document.getElementById("pdfRiskBox");
    if (pdfRiskBox) {
        pdfRiskBox.style.borderColor = color;
    }

    setElemText("pdfHealthScore", `${healthScoreVal} / 100`);

    const pdfRiskFactors = document.getElementById("pdfRiskFactors");
    if (pdfRiskFactors && riskFactors) {
        pdfRiskFactors.innerHTML = riskFactors.innerHTML;
    }

    const pdfRecommendation = document.getElementById("pdfRecommendation");
    if (pdfRecommendation) {
        pdfRecommendation.innerHTML = recommendation;
    }

    // 8. PDF Download Handler with jsPDF 2.5.1 (Direct File Export)
    const downloadBtn = document.getElementById("downloadBtn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", function () {
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating PDF...';
            downloadBtn.disabled = true;

            try {
                let JS_PDF = null;
                if (window.jspdf && window.jspdf.jsPDF) {
                    JS_PDF = window.jspdf.jsPDF;
                } else if (typeof window.jsPDF === "function") {
                    JS_PDF = window.jsPDF;
                }

                if (!JS_PDF) {
                    throw new Error("jsPDF library unavailable");
                }

                const doc = new JS_PDF("p", "mm", "a4");

                // Safe String Extraction
                const pName = (patientName && typeof patientName === "string") ? patientName : "Patient";
                const cleanName = pName.replace(/[^a-zA-Z0-9]/g, "_");
                const pID = (predictionID && typeof predictionID === "string") ? predictionID : "HC-9921";
                const pAge = patientAge ? String(patientAge) : "N/A";
                const pGender = patientGender ? (String(patientGender).charAt(0).toUpperCase() + String(patientGender).slice(1)) : "N/A";
                const pDate = predictionDate || new Date().toLocaleDateString();
                const pGlucose = patientGlucose ? `${patientGlucose} mg/dL` : "-";
                const pBMI = patientBMI ? `${patientBMI.toFixed(2)} (${bmiCategory || 'Normal'})` : "-";
                const pBP = patientBP ? `${patientBP} mmHg` : "-";

                const famHist = localStorage.getItem("familyHistory") === "1" ? "Yes (Positive)" : "No (Negative)";
                const heartDis = localStorage.getItem("heartDisease") === "1" ? "Yes (Present)" : "No (None)";
                const smokHab = localStorage.getItem("smoking") === "1" ? "Yes (Active)" : "No (Non-smoker)";

                const recClean = recommendation ? String(recommendation).replace(/<[^>]*>/g, "") : "Maintain low-GI diet and 150 mins weekly exercise.";

                // Palette
                const primaryBlue = [30, 64, 175];
                const textDark = [15, 23, 42];
                const textMuted = [71, 85, 105];
                const lineBorder = [203, 213, 225];
                const bgLight = [248, 250, 252];

                // 1. Top Accent Line
                doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
                doc.rect(15, 15, 180, 2, "F");

                // Header Title
                doc.setFont("helvetica", "bold");
                doc.setFontSize(17);
                doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
                doc.text("AI Diabetes Prediction System", 15, 24);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("Clinical Health Risk Assessment Report • Machine Learning Analysis", 15, 29.5);

                // Badge
                doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
                doc.roundedRect(145, 18, 50, 6.5, 1.5, 1.5, "F");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.5);
                doc.setTextColor(255, 255, 255);
                doc.text("CONFIDENTIAL REPORT", 170, 22.5, { align: "center" });

                doc.setFontSize(7.5);
                doc.setTextColor(100, 116, 139);
                doc.text(`Date: ${pDate}`, 195, 29.5, { align: "right" });

                // Divider
                doc.setDrawColor(lineBorder[0], lineBorder[1], lineBorder[2]);
                doc.setLineWidth(0.4);
                doc.line(15, 33, 195, 33);

                // 2. Patient Profile Box
                doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
                doc.setDrawColor(lineBorder[0], lineBorder[1], lineBorder[2]);
                doc.roundedRect(15, 37, 180, 52, 2.5, 2.5, "FD");

                doc.setFont("helvetica", "bold");
                doc.setFontSize(10.5);
                doc.setTextColor(30, 58, 138);
                doc.text("Patient Health Profile", 20, 44);

                doc.setDrawColor(lineBorder[0], lineBorder[1], lineBorder[2]);
                doc.line(20, 46.5, 190, 46.5);

                doc.setFontSize(9);

                // Row 1
                doc.setFont("helvetica", "bold"); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("Patient Name:", 20, 53);
                doc.setFont("helvetica", "bold"); doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                doc.text(pName, 55, 53);

                doc.setFont("helvetica", "bold"); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("Prediction ID:", 115, 53);
                doc.setFont("helvetica", "bold"); doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                doc.text(pID, 150, 53);

                // Row 2
                doc.setFont("helvetica", "bold"); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("Age / Gender:", 20, 60);
                doc.setFont("helvetica", "bold"); doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                doc.text(`${pAge} yrs / ${pGender}`, 55, 60);

                doc.setFont("helvetica", "bold"); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("Date & Time:", 115, 60);
                doc.setFont("helvetica", "bold"); doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                doc.text(pDate, 150, 60);

                // Row 3
                doc.setFont("helvetica", "bold"); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("Glucose Level:", 20, 67);
                doc.setFont("helvetica", "bold"); doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                doc.text(pGlucose, 55, 67);

                doc.setFont("helvetica", "bold"); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("BMI & Category:", 115, 67);
                doc.setFont("helvetica", "bold"); doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                doc.text(pBMI, 150, 67);

                // Row 4
                doc.setFont("helvetica", "bold"); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("Blood Pressure:", 20, 74);
                doc.setFont("helvetica", "bold"); doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                doc.text(pBP, 55, 74);

                doc.setFont("helvetica", "bold"); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("Family History:", 115, 74);
                doc.setFont("helvetica", "bold"); doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                doc.text(famHist, 150, 74);

                // Row 5
                doc.setFont("helvetica", "bold"); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("Heart Disease:", 20, 81);
                doc.setFont("helvetica", "bold"); doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                doc.text(heartDis, 55, 81);

                doc.setFont("helvetica", "bold"); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("Smoking Habit:", 115, 81);
                doc.setFont("helvetica", "bold"); doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                doc.text(smokHab, 150, 81);

                // 3. Risk Gauge & Score Cards
                const rVal = (typeof risk === "number" && !isNaN(risk)) ? risk : 0;
                const rLvl = level || "Low Risk";
                const hScore = healthScoreVal || 85;

                let riskRGB = [34, 197, 94]; // Green
                if (rVal > 60) riskRGB = [220, 38, 38]; // Red
                else if (rVal > 30) riskRGB = [217, 119, 6]; // Orange

                // Risk Box Left
                doc.setDrawColor(riskRGB[0], riskRGB[1], riskRGB[2]);
                doc.setLineWidth(0.8);
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(15, 94, 86, 36, 2.5, 2.5, "FD");

                doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("ESTIMATED DIABETES RISK", 58, 101, { align: "center" });

                doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(riskRGB[0], riskRGB[1], riskRGB[2]);
                doc.text(`${Math.round(rVal)}%`, 58, 114, { align: "center" });

                doc.setFillColor(riskRGB[0], riskRGB[1], riskRGB[2]);
                doc.roundedRect(38, 119, 40, 6, 3, 3, "F");
                doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
                doc.text(rLvl, 58, 123.2, { align: "center" });

                // Health Score Box Right
                doc.setDrawColor(lineBorder[0], lineBorder[1], lineBorder[2]);
                doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
                doc.roundedRect(109, 94, 86, 36, 2.5, 2.5, "FD");

                doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("OVERALL HEALTH SCORE", 152, 101, { align: "center" });

                doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(5, 150, 105);
                doc.text(`${hScore} / 100`, 152, 114, { align: "center" });

                doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
                doc.text("Higher score indicates better metabolic condition", 152, 123, { align: "center" });

                // 4. Clinical Factors Box
                doc.setDrawColor(lineBorder[0], lineBorder[1], lineBorder[2]);
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(15, 135, 180, 42, 2.5, 2.5, "FD");

                doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(30, 58, 138);
                doc.text("Key Clinical Risk Factors & Observations", 20, 142);

                doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(30, 41, 59);

                let factorList = [];
                const gVal = parseFloat(patientGlucose) || 0;
                const bpVal = parseFloat(patientBP) || 0;
                const bmiVal = parseFloat(patientBMI) || 0;
                const ageVal = parseInt(patientAge) || 0;

                if (gVal >= 140) factorList.push("- High Fasting Glucose: Glucose level is 140 mg/dL or higher.");
                if (bpVal >= 140) factorList.push("- High Blood Pressure: Blood pressure is 140 mmHg or higher.");
                if (bmiVal >= 25) factorList.push(`- Elevated BMI (${bmiVal.toFixed(1)}): Indicates elevated body mass.`);
                if (ageVal >= 45) factorList.push("- Age Factor: Age 45 years or older increases metabolic risk.");
                if (localStorage.getItem("familyHistory") === "1") factorList.push("- Family History: Positive genetic history of diabetes recorded.");
                if (localStorage.getItem("heartDisease") === "1") factorList.push("- Heart Disease: History of cardiovascular condition.");
                if (localStorage.getItem("smoking") === "1") factorList.push("- Smoking Habit: Active smoking habit increases metabolic health risk.");
                if (factorList.length === 0) factorList.push("- Optimal Health Indicators: No major clinical diabetes risk factors detected.");

                let startY = 149;
                factorList.forEach(f => {
                    let lines = doc.splitTextToSize(f, 170);
                    doc.text(lines, 20, startY);
                    startY += (lines.length * 4.5);
                });

                // 5. Action Plan Box
                let planY = Math.max(182, startY + 4);
                doc.setDrawColor(191, 219, 254);
                doc.setFillColor(239, 246, 255);
                doc.roundedRect(15, planY, 180, 32, 2.5, 2.5, "FD");

                doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(30, 64, 175);
                doc.text("Recommended Health Action Plan", 20, planY + 7);

                doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(30, 58, 138);
                let recLines = doc.splitTextToSize(recClean, 170);
                doc.text(recLines, 20, planY + 14);

                // 6. Footer Disclaimer & Signature
                doc.setDrawColor(lineBorder[0], lineBorder[1], lineBorder[2]);
                doc.line(15, 225, 195, 225);

                doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
                let discText = "Medical Disclaimer: This risk assessment is generated by an AI Machine Learning model trained on clinical indicators. It provides educational screening information only and does not constitute a formal medical diagnosis. Please consult a qualified physician or endocrinologist for laboratory testing and confirmation.";
                let discLines = doc.splitTextToSize(discText, 135);
                doc.text(discLines, 15, 230);

                doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(30, 64, 175);
                doc.text("HealthCare AI System", 195, 231, { align: "right" });
                doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
                doc.text("Verified Digital Report", 195, 235, { align: "right" });

                // Direct File Save
                doc.save(`Diabetes_Report_${cleanName}.pdf`);

                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            } catch (err) {
                console.error("PDF generation exception:", err);
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
                alert("PDF Generation Error: " + err.message);
            }
        });
    }

    // 9. Copy Summary Button Handler (if present)
    const copyBtn = document.getElementById("copySummaryBtn");
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            const summary = `🩺 AI Diabetes Prediction Report\n` +
                `Patient Name: ${patientName}\n` +
                `Risk Score: ${risk}%\n` +
                `Risk Category: ${level}\n` +
                `BMI: ${patientBMI} (${bmiCategory})\n` +
                `Glucose: ${patientGlucose} mg/dL\n` +
                `Blood Pressure: ${patientBP} mmHg\n` +
                `Date: ${predictionDate}`;

            navigator.clipboard.writeText(summary).then(() => {
                alert("📋 Report summary copied to clipboard!");
            });
        });
    }
});