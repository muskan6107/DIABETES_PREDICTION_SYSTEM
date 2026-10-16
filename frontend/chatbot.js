// ==========================================
// HEALTHCARE AI CHATBOT SYSTEM - ENHANCED JS
// chatbot.js
// ==========================================

(function () {
    const CHATBOT_HTML = `
<div class="hc-toggle-wrapper">
    <button id="hcToggle" class="hc-toggle" title="Chat with HealthCare AI">
        <span class="hc-toggle-pulse"></span>
        <i class="fa-solid fa-user-doctor"></i>
    </button>
</div>

<div id="hcChat" class="hc-chat">
    <!-- Header -->
    <div class="hc-header">
        <div class="hc-profile">
            <div class="hc-avatar-wrap">
                <div class="hc-avatar">
                    <i class="fa-solid fa-user-doctor"></i>
                </div>
                <span class="hc-status-indicator"></span>
            </div>
            <div class="hc-info">
                <h3>HealthCare AI <i class="fa-solid fa-circle-check" style="color:#60a5fa;font-size:14px;"></i></h3>
                <p>
                    <span class="hc-dot"></span>
                    Online • AI Medical Assistant
                </p>
            </div>
        </div>
        <div class="hc-header-actions">
            <button id="hcNewChat" class="hc-header-btn" title="Start New Fresh Chat">
                <i class="fa-solid fa-plus"></i>
            </button>
            <button id="hcHistoryToggle" class="hc-header-btn" title="View Old Chats">
                <i class="fa-solid fa-clock-rotate-left"></i>
            </button>
            <button id="hcClear" class="hc-header-btn" title="Clear Current View">
                <i class="fa-solid fa-trash-can"></i>
            </button>
            <button id="hcClose" class="hc-header-btn hc-close" title="Close Chat">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    </div>

    <!-- Old Chats Panel (Drawer) -->
    <div id="hcHistoryPanel" class="hc-history-panel">
        <div class="hc-history-header">
            <h4><i class="fa-solid fa-clock-rotate-left"></i> Saved Chat History</h4>
            <button id="hcCloseHistory" class="hc-icon-sm" title="Back to Chat"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="hcHistoryList" class="hc-history-list"></div>
        <div class="hc-history-footer">
            <button id="hcClearAllSessions" class="hc-btn-danger"><i class="fa-solid fa-trash"></i> Delete All Old Chats</button>
        </div>
    </div>

    <!-- Messages Container -->
    <div id="hcMessages" class="hc-messages"></div>

    <!-- Typing Indicator -->
    <div id="hcTyping" class="hc-typing">
        <span></span>
        <span></span>
        <span></span>
    </div>

    <!-- Quick Suggestions -->
    <div class="hc-suggestions-wrapper">
        <div class="hc-suggestions-title">Quick Topics & Help</div>
        <div class="hc-suggestions">
            <button class="hc-chip" data-cmd="how to use app"><i class="fa-solid fa-circle-question"></i> How to Use App</button>
            <button class="hc-chip" data-cmd="what can app do"><i class="fa-solid fa-cubes"></i> What Can App Do?</button>
            <button class="hc-chip" data-cmd="predict risk"><i class="fa-solid fa-stethoscope"></i> Predict Risk</button>
            <button class="hc-chip" data-cmd="diet guide"><i class="fa-solid fa-utensils"></i> Diet Guide</button>
            <button class="hc-chip" data-cmd="blood sugar"><i class="fa-solid fa-droplet"></i> Blood Sugar</button>
            <button class="hc-chip" data-cmd="bmi guide"><i class="fa-solid fa-calculator"></i> BMI Guide</button>
            <button class="hc-chip" data-cmd="view old chats"><i class="fa-solid fa-clock-rotate-left"></i> Old Chats</button>
        </div>
    </div>

    <!-- Footer Input -->
    <div class="hc-footer">
        <div class="hc-input-wrap">
            <input type="text" id="hcInput" placeholder="Ask your health question or app guide..." autocomplete="off">
        </div>
        <button id="hcSend" title="Send Message">
            <i class="fa-solid fa-paper-plane"></i>
        </button>
    </div>
    <div class="hc-disclaimer">
        🔒 Confidential AI Assistant • Educational Purposes Only
    </div>
</div>
`;

    // Global Action Utilities
    window.hcCopyText = function (btn) {
        const msgWrap = btn.closest(".hc-msg-wrap");
        if (!msgWrap) return;
        const botBubble = msgWrap.querySelector(".hc-bot");
        if (!botBubble) return;

        const textToCopy = botBubble.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check" style="color:#22c55e;"></i>';
            setTimeout(() => { btn.innerHTML = orig; }, 1500);
        });
    };

    window.hcSpeakText = function (btn) {
        const msgWrap = btn.closest(".hc-msg-wrap");
        if (!msgWrap) return;
        const botBubble = msgWrap.querySelector(".hc-bot");
        if (!botBubble) return;

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any active speech
            const textToSpeak = botBubble.innerText;
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            btn.style.color = "#2563eb";
            utterance.onend = () => { btn.style.color = ""; };
            utterance.onerror = () => { btn.style.color = ""; };
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Speech synthesis is not supported in this browser.");
        }
    };

    function initChatbot() {
        let container = document.getElementById("chatbot-container");
        if (!document.getElementById("hcChat")) {
            if (!container) {
                container = document.createElement("div");
                container.id = "chatbot-container";
                document.body.appendChild(container);
            }
            container.innerHTML = CHATBOT_HTML;
        }

        const toggle = document.getElementById("hcToggle");
        const chat = document.getElementById("hcChat");
        const close = document.getElementById("hcClose");
        const clearBtn = document.getElementById("hcClear");
        const newChatBtn = document.getElementById("hcNewChat");
        const historyToggleBtn = document.getElementById("hcHistoryToggle");

        const historyPanel = document.getElementById("hcHistoryPanel");
        const closeHistoryBtn = document.getElementById("hcCloseHistory");
        const historyList = document.getElementById("hcHistoryList");
        const clearAllSessionsBtn = document.getElementById("hcClearAllSessions");

        const messages = document.getElementById("hcMessages");
        const input = document.getElementById("hcInput");
        const send = document.getElementById("hcSend");
        const typing = document.getElementById("hcTyping");

        if (!toggle || !chat || !close || !messages || !input || !send || !typing) {
            return;
        }

        let currentSessionId = null;
        let hasUserSentMessageInCurrent = false;

        function getTimestamp() {
            const now = new Date();
            return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // ================= SESSION HISTORY MANAGEMENT =================
        function getSavedSessions() {
            try {
                return JSON.parse(localStorage.getItem("hcSavedChatSessions")) || [];
            } catch (e) {
                return [];
            }
        }

        function saveSessionsList(sessions) {
            localStorage.setItem("hcSavedChatSessions", JSON.stringify(sessions));
        }

        function archiveCurrentSession() {
            if (!hasUserSentMessageInCurrent || !currentSessionId) return;

            const userMsgs = messages.querySelectorAll(".hc-msg-wrap.user .hc-user");
            if (userMsgs.length === 0) return;

            const firstQuery = userMsgs[0].innerText.trim();
            const previewTitle = firstQuery.length > 32 ? firstQuery.substring(0, 32) + "..." : firstQuery;

            const sessions = getSavedSessions();
            const existingIndex = sessions.findIndex(s => s.id === currentSessionId);

            const sessionData = {
                id: currentSessionId,
                timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                title: previewTitle,
                html: messages.innerHTML,
                msgCount: userMsgs.length
            };

            if (existingIndex >= 0) {
                sessions[existingIndex] = sessionData;
            } else {
                sessions.unshift(sessionData);
            }

            saveSessionsList(sessions);
        }

        function loadHistoryPanel() {
            if (!historyList) return;
            const sessions = getSavedSessions();
            historyList.innerHTML = "";

            if (sessions.length === 0) {
                historyList.innerHTML = `
                    <div style="text-align:center; padding:35px 15px; color:#64748b;">
                        <div style="font-size:32px;margin-bottom:10px;">📜</div>
                        <b>No Saved Chat Sessions</b>
                        <p style="font-size:12px;margin-top:6px;">Your past chat conversations will appear here.</p>
                    </div>
                `;
                return;
            }

            sessions.forEach(sess => {
                const item = document.createElement("div");
                item.className = "hc-history-item";
                item.innerHTML = `
                    <div class="hc-history-content">
                        <div class="hc-history-title">💬 ${sess.title || "Chat Session"}</div>
                        <div class="hc-history-meta">
                            <span><i class="fa-solid fa-clock"></i> ${sess.timestamp}</span>
                            <span>• ${sess.msgCount} queries</span>
                        </div>
                    </div>
                    <button class="hc-history-del" title="Delete session" data-id="${sess.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;

                item.onclick = (e) => {
                    if (e.target.closest(".hc-history-del")) return;
                    restoreChatSession(sess);
                };

                const delBtn = item.querySelector(".hc-history-del");
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    deleteSession(sess.id);
                };

                historyList.appendChild(item);
            });
        }

        function restoreChatSession(session) {
            archiveCurrentSession(); // Save existing state before switching
            currentSessionId = session.id;
            hasUserSentMessageInCurrent = true;
            messages.innerHTML = session.html;
            historyPanel.classList.remove("active");
            messages.scrollTop = messages.scrollHeight;
            bindMsgActions();
        }

        function deleteSession(id) {
            let sessions = getSavedSessions();
            sessions = sessions.filter(s => s.id !== id);
            saveSessionsList(sessions);
            loadHistoryPanel();
        }

        if (clearAllSessionsBtn) {
            clearAllSessionsBtn.onclick = () => {
                if (confirm("Are you sure you want to delete all saved chat history sessions?")) {
                    localStorage.removeItem("hcSavedChatSessions");
                    loadHistoryPanel();
                }
            };
        }

        if (historyToggleBtn) {
            historyToggleBtn.onclick = () => {
                loadHistoryPanel();
                historyPanel.classList.toggle("active");
            };
        }

        if (closeHistoryBtn) {
            closeHistoryBtn.onclick = () => {
                historyPanel.classList.remove("active");
            };
        }

        // ================= FRESH START CHAT INITIALIZER =================
        function startFreshSession() {
            archiveCurrentSession();
            currentSessionId = "chat_" + Date.now();
            hasUserSentMessageInCurrent = false;
            messages.innerHTML = "";
            renderWelcomeMessage();
            if (historyPanel) historyPanel.classList.remove("active");
        }

        function renderWelcomeMessage() {
            const welcomeHTML = `
            <div class="hc-msg-wrap bot">
                <div class="hc-bot">
                    <div class="hc-welcome-card" style="padding: 16px;">
                        <div class="hc-welcome-header" style="margin-bottom: 0;">
                            <span class="hc-badge-tag"><i class="fa-solid fa-sparkles"></i> HealthCare AI Assistant</span>
                            <h4 style="margin: 8px 0 6px; font-size: 16px; color: #1e3a8a;">👋 Welcome to HealthCare AI!</h4>
                            <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
                                Hello! I am your 24/7 AI Medical Assistant. How can I help you today? You can ask me health questions, diabetes risk queries, diet tips, or use the quick topic buttons below!
                            </p>
                        </div>
                    </div>
                </div>
                <div class="hc-msg-actions">
                    <button class="hc-action-btn" title="Copy Message" onclick="hcCopyText(this)"><i class="fa-solid fa-copy"></i> Copy</button>
                    <button class="hc-action-btn" title="Listen" onclick="hcSpeakText(this)"><i class="fa-solid fa-volume-high"></i> Listen</button>
                </div>
                <div class="hc-time">${getTimestamp()}</div>
            </div>`;
            messages.innerHTML = welcomeHTML;
            messages.scrollTop = messages.scrollHeight;
        }

        // OPEN CHAT -> Always show fresh welcome view on opening as requested!
        toggle.addEventListener("click", () => {
            chat.classList.add("active");
            toggle.style.display = "none";

            // If opening and current chat view is empty or clean, start fresh session
            if (!hasUserSentMessageInCurrent) {
                startFreshSession();
            }
            input.focus();
        });

        // CLOSE CHAT -> Archive current session so history is preserved
        close.addEventListener("click", () => {
            archiveCurrentSession();
            chat.classList.remove("active");
            toggle.style.display = "flex";
            if (historyPanel) historyPanel.classList.remove("active");
        });

        // NEW CHAT BUTTON
        if (newChatBtn) {
            newChatBtn.onclick = () => {
                startFreshSession();
            };
        }

        // CLEAR VIEW BUTTON
        if (clearBtn) {
            clearBtn.onclick = () => {
                startFreshSession();
            };
        }

        // ================= BOT MESSAGE BUILDER =================
        function bot(text) {
            const wrap = document.createElement("div");
            wrap.className = "hc-msg-wrap bot";

            const div = document.createElement("div");
            div.className = "hc-bot";
            div.innerHTML = text;

            const actions = document.createElement("div");
            actions.className = "hc-msg-actions";
            actions.innerHTML = `
                <button class="hc-action-btn" title="Copy Message" onclick="hcCopyText(this)"><i class="fa-solid fa-copy"></i> Copy</button>
                <button class="hc-action-btn" title="Listen" onclick="hcSpeakText(this)"><i class="fa-solid fa-volume-high"></i> Listen</button>
            `;

            const time = document.createElement("div");
            time.className = "hc-time";
            time.innerText = getTimestamp();

            wrap.appendChild(div);
            wrap.appendChild(actions);
            wrap.appendChild(time);
            messages.appendChild(wrap);
            messages.scrollTop = messages.scrollHeight;

            archiveCurrentSession();
        }

        // ================= USER MESSAGE BUILDER =================
        function user(text) {
            hasUserSentMessageInCurrent = true;
            const wrap = document.createElement("div");
            wrap.className = "hc-msg-wrap user";

            const div = document.createElement("div");
            div.className = "hc-user";
            div.innerHTML = text;

            const time = document.createElement("div");
            time.className = "hc-time";
            time.innerText = getTimestamp();

            wrap.appendChild(div);
            wrap.appendChild(time);
            messages.appendChild(wrap);
            messages.scrollTop = messages.scrollHeight;
        }

        // ================= SEND MESSAGE =================
        function sendMessage(customText = null) {
            const text = customText !== null ? customText : input.value.trim();
            if (text === "") return;

            user(text);
            if (customText === null) input.value = "";

            typing.classList.add("active");
            messages.scrollTop = messages.scrollHeight;

            setTimeout(() => {
                typing.classList.remove("active");
                bot(getReply(text));
            }, 600);
        }

        send.addEventListener("click", () => sendMessage());

        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                sendMessage();
            }
        });

        // CHIP CLICK HANDLERS
        function bindChips() {
            const chips = document.querySelectorAll(".hc-chip");
            chips.forEach(chip => {
                chip.onclick = () => {
                    const cmd = chip.getAttribute("data-cmd") || chip.innerText.trim();
                    if (cmd.includes("view old chats") || cmd.includes("Old Chats")) {
                        loadHistoryPanel();
                        historyPanel.classList.add("active");
                    } else {
                        sendMessage(cmd);
                    }
                };
            });
        }
        bindChips();

        function bindMsgActions() {
            // Helper for dynamic binding if required
        }

        // ================= AI REPLIES ENGINE =================
        function getReply(msg) {
            msg = msg.toLowerCase();

            // Specific Topic Chips First
            if (msg.includes("diet") || msg.includes("food") || msg.includes("eat") || msg.includes("nutrition")) {
                return "🥗 <b>Diabetic Diet & Nutrition Advice</b><br><br>" +
                    "<b>✔ High-Value Choices:</b><br>" +
                    "• Leafy greens (spinach, kale, broccoli)<br>" +
                    "• High-fiber grains (oats, quinoa, brown rice)<br>" +
                    "• Lean proteins (fish, skinless poultry, lentils)<br>" +
                    "• Low GI fruits (berries, green apples)<br><br>" +
                    "<b>❌ Items to Limit or Avoid:</b><br>" +
                    "• Sugary drinks, carbonated sodas & canned juices<br>" +
                    "• Refined flour, white bread, sweets & fried snacks";
            }

            if (msg.includes("bmi") || msg.includes("weight") || msg.includes("height")) {
                return "📊 <b>Body Mass Index (BMI) Reference</b><br><br>" +
                    "<b>Formula:</b> Weight (kg) ÷ [Height (m)]²<br><br>" +
                    "• <b>Underweight:</b> < 18.5<br>" +
                    "• 🟢 <b>Normal Weight:</b> 18.5 – 24.9<br>" +
                    "• 🟡 <b>Overweight:</b> 25 – 29.9<br>" +
                    "• 🔴 <b>Obese:</b> 30 or higher";
            }

            // How to use & App capabilities
            if (msg.includes("how to use") || msg.includes("how app works") || msg.includes("instructions") || msg.includes("use app")) {
                return "💡 <b>How to Use AI Diabetes Prediction System:</b><br><br>" +
                    "1️⃣ <b>Go to Prediction Page:</b> Click <a href='predict.html'>Prediction</a> in top navbar.<br>" +
                    "2️⃣ <b>Enter Health Parameters:</b> Fill in your Age, Glucose Level, Blood Pressure, Height, Weight (BMI is auto-calculated), Family History & Smoking.<br>" +
                    "3️⃣ <b>Try Quick Demo Autofill:</b> Click 'Low Risk Demo' or 'High Risk Demo' buttons for sample clinical values.<br>" +
                    "4️⃣ <b>Calculate Risk:</b> Click <b>Predict Diabetes Risk</b> to trigger ML model evaluation.<br>" +
                    "5️⃣ <b>Download Official PDF:</b> On the result page, click <b>Download PDF Report</b> to get a crisp 1-page document!";
            }

            if (msg.includes("what can app do") || msg.includes("feature") || msg.includes("capability") || msg.includes("about app")) {
                return "📌 <b>Key System Features & Capabilities:</b><br><br>" +
                    "• 🤖 <b>AI Prediction Engine:</b> Trained Random Forest model providing precise risk scoring.<br>" +
                    "• 📊 <b>Interactive Visual Dashboard:</b> Real-time risk meter, health score & factor breakdown.<br>" +
                    "• 📄 <b>High-Contrast PDF Reports:</b> Printable 1-page medical reports with clinical formatting.<br>" +
                    "• 📜 <b>Local Prediction History & CSV Export:</b> Store past patient records & download Excel/CSV.<br>" +
                    "• 💬 <b>24/7 Health Assistant:</b> Get answers on diabetes symptoms, diet, exercise, and ranges!";
            }

            if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey") || msg.includes("namaste")) {
                return "👋 <b>Hello!</b> Welcome to <b>HealthCare AI Assistant</b>.<br>How can I assist you with your health today?";
            }

            if (msg.includes("diabetes") || msg.includes("sugar") || msg.includes("blood sugar")) {
                return "🩺 <b>Diabetes & Blood Sugar Guide</b><br><br>" +
                    "Diabetes occurs when blood glucose levels are elevated due to insulin deficiency or resistance.<br><br>" +
                    "<b>Fasting Blood Glucose Ranges:</b><br>" +
                    "• 🟢 <b>Normal:</b> 70 – 99 mg/dL<br>" +
                    "• 🟡 <b>Prediabetes:</b> 100 – 125 mg/dL<br>" +
                    "• 🔴 <b>Diabetes:</b> 126+ mg/dL<br><br>" +
                    "<i>Try asking about <b>symptoms</b> or <b>diet tips</b>!</i>";
            }

            if (msg.includes("symptom") || msg.includes("sign")) {
                return "📋 <b>Common Diabetes Warning Symptoms</b><br><br>" +
                    "• Frequent urination (especially at night)<br>" +
                    "• Excessive thirst & dry mouth<br>" +
                    "• Constant fatigue & hunger<br>" +
                    "• Blurred vision & dizziness<br>" +
                    "• Slow wound healing & dry skin";
            }

            if (msg.includes("exercise") || msg.includes("walk") || msg.includes("workout") || msg.includes("fitness")) {
                return "🏃 <b>Exercise & Physical Activity Guidelines</b><br><br>" +
                    "Physical activity increases insulin sensitivity and helps muscles absorb blood glucose.<br><br>" +
                    "• <b>Weekly Target:</b> At least 150 minutes of moderate aerobic exercise (30 mins/day, 5 days).<br>" +
                    "• <b>Recommended Activities:</b> Brisk walking, cycling, swimming, resistance training, and yoga.";
            }

            if (msg.includes("bp") || msg.includes("blood pressure") || msg.includes("pressure")) {
                return "🩸 <b>Blood Pressure Reference Guidelines</b><br><br>" +
                    "• 🟢 <b>Normal BP:</b> Under 120/80 mmHg<br>" +
                    "• 🟡 <b>Elevated BP:</b> 120–129 / <80 mmHg<br>" +
                    "• 🔴 <b>High BP (Hypertension):</b> 130+ / 80+ mmHg";
            }

            if (msg.includes("pdf") || msg.includes("download") || msg.includes("report")) {
                return "📄 <b>Official Medical PDF Report Export</b><br><br>" +
                    "Our system generates a crystal clear, high-contrast 1-page PDF document including patient metrics, risk gauge, score, clinical factors, and medical advice.<br><br>" +
                    "To download: Complete a prediction on the <b><a href='predict.html'>Prediction Page</a></b> and click <b>Download PDF Report</b>!";
            }

            if (msg.includes("risk") || msg.includes("predict")) {
                return "🚀 <b>Diabetes Risk Calculator</b><br><br>" +
                    "Calculate your personalized diabetes risk score using our AI Model on the <b><a href='predict.html'>Prediction Page</a></b>.";
            }

            return "🤖 <b>HealthCare AI Assistant</b><br><br>" +
                "I am ready to help you with:<br>" +
                "• 🥗 <b>Diet Guide & Nutrition</b><br>" +
                "• 📊 <b>BMI Guide & Ranges</b><br>" +
                "• 💡 <b>How to Use App</b><br>" +
                "• 📌 <b>What Can App Do</b><br>" +
                "• 🩺 <b>Diabetes Risk Prediction</b><br>" +
                "• 📋 <b>Symptoms & Warning Signs</b>";
        }

        // Initialize fresh session on load
        startFreshSession();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initChatbot);
    } else {
        initChatbot();
    }
})();