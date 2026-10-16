// =====================================================
// AI Diabetes Prediction System
// History Page Script
// =====================================================

let historyData = [];

try {
    historyData = JSON.parse(localStorage.getItem("history")) || [];
} catch (e) {
    historyData = [];
}

const tbody = document.querySelector("#historyTable tbody");
const totalRecords = document.getElementById("totalRecords");

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
    loadHistory();
});

function loadHistory(filterLevel = "all") {
    if (!tbody) return;
    tbody.innerHTML = "";

    if (totalRecords) totalRecords.innerText = historyData.length;

    let filtered = historyData;
    if (filterLevel !== "all") {
        filtered = historyData.filter(item => item.level === filterLevel);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
        <tr>
            <td colspan="11" style="text-align:center; padding:35px; color:#64748b;">
                <div style="font-size:24px;margin-bottom:8px;">📁</div>
                <b>No Prediction History Records Found</b>
            </td>
        </tr>`;
        return;
    }

    filtered.forEach((item, index) => {
        let badgeColor = "#22c55e";
        if (item.level === "Moderate Risk") badgeColor = "#f59e0b";
        if (item.level === "High Risk") badgeColor = "#ef4444";

        const realIndex = historyData.indexOf(item);

        tbody.innerHTML += `
        <tr>
            <td><code>${item.id || "DIA-000"}</code></td>
            <td><b>${item.name || "Patient"}</b></td>
            <td>${item.age}</td>
            <td>${item.gender ? (item.gender.charAt(0).toUpperCase() + item.gender.slice(1)) : "-"}</td>
            <td>${item.glucose} mg/dL</td>
            <td>${item.bloodPressure || "-"} mmHg</td>
            <td>${item.bmi}</td>
            <td><b>${item.risk}%</b></td>
            <td>
                <span style="background:${badgeColor};color:white;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;display:inline-block;">
                    ${item.level}
                </span>
            </td>
            <td>${item.date || ""}<br><small style="color:#94a3b8;">${item.time || ""}</small></td>
            <td>
                <button class="delete-btn" style="background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;" onclick="deleteRecord(${realIndex})">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </td>
        </tr>`;
    });
}

// Delete Single Record
window.deleteRecord = function (index) {
    if (confirm("Are you sure you want to delete this prediction record?")) {
        historyData.splice(index, 1);
        localStorage.setItem("history", JSON.stringify(historyData));
        loadHistory();
    }
};

// Clear All History
window.clearHistory = function () {
    if (confirm("Are you sure you want to delete ALL prediction history records? This cannot be undone.")) {
        historyData = [];
        localStorage.removeItem("history");
        loadHistory();
    }
};

// Search Filter
window.searchHistory = function () {
    const value = document.getElementById("searchBox").value.toLowerCase().trim();
    const rows = document.querySelectorAll("#historyTable tbody tr");

    rows.forEach(row => {
        if (row.cells.length < 2) return;
        const patientName = row.cells[1].innerText.toLowerCase();
        const predID = row.cells[0].innerText.toLowerCase();

        if (patientName.includes(value) || predID.includes(value)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
};

// Export History as CSV Spreadsheet
window.exportToCSV = function () {
    if (!historyData || historyData.length === 0) {
        alert("No prediction records to export.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Prediction ID,Patient Name,Age,Gender,Glucose,Blood Pressure,BMI,Risk Score (%),Risk Level,Date,Time\n";

    historyData.forEach(item => {
        const dateStr = item.date || "";
        const timeStr = item.time || "";

        const row = [
            `"${item.id || ''}"`,
            `"${item.name || ''}"`,
            `"${item.age || ''}"`,
            `"${item.gender || ''}"`,
            `"${item.glucose || ''}"`,
            `"${item.bloodPressure || ''}"`,
            `"${item.bmi || ''}"`,
            `"${item.risk || ''}"`,
            `"${item.level || ''}"`,
            `=" ${dateStr} "`,
            `=" ${timeStr} "`
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Diabetes_Prediction_History_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};