// =======================================
// AI Diabetes Prediction
// Dark Mode
// =======================================

const themeButton = document.getElementById("themeToggle");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark-mode");

    if (themeButton) {

        themeButton.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

    }

}

// Toggle theme
if (themeButton) {

    themeButton.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {

            localStorage.setItem("theme", "dark");

            themeButton.innerHTML =
            '<i class="fa-solid fa-sun"></i>';

        }

        else {

            localStorage.setItem("theme", "light");

            themeButton.innerHTML =
            '<i class="fa-solid fa-moon"></i>';

        }

    });

}