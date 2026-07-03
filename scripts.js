let studyMinutes = 25;
let breakMinutes = 5;
let remainingSeconds = studyMinutes * 60;
let isRunning = false;
let isStudy = true;
let timerInterval = null;
let totalStudyMinutes = 0;
let history = [];


const saveHistory = localStorage.getItem("protomoHistory");
if (saveHistory !== null) {
    history = JSON.parse(saveHistory);
}

const saveTotal = localStorage.getItem("protomoTotal");
if (saveTotal !== null) {
    totalStudyMinutes = parseInt(saveTotal, 10);
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    isStudy = true;
    remainingSeconds = 60 * studyMinutes;
    render();
}
document.getElementById('resetBtn').addEventListener('click', resetTimer);

function skipBlock() {
    clearInterval(timerInterval);
    isRunning = false;
    isStudy = !isStudy;
    if (isStudy) {
        remainingSeconds = 60 * studyMinutes;
    } else {
        remainingSeconds = 60 * breakMinutes;
    }
    
    render();
}
document.getElementById('skipBtn').addEventListener('click', skipBlock);

function toggleSettings() {
    const panel = document.getElementById("settingsPanel");
    panel.classList.toggle('open');
}
document.getElementById("settingsToggle").addEventListener("click", toggleSettings);

function applyConfig() {
    const newStudy = parseInt(document.getElementById("studyInput").value);
    const newBreak = parseInt(document.getElementById("breakInput").value);

    if (isNaN(newStudy) || newStudy < 1) { return; }
    if (isNaN(newBreak) || newBreak < 1) { return; }

    studyMinutes = newStudy;
    breakMinutes = newBreak;

    if (!isRunning) {
        remainingSeconds = studyMinutes * 60;
        isStudy = true;
    }
    render();
    document.getElementById('settingsPanel').classList.remove('open');
}
document.getElementById('applyBtn').addEventListener('click', applyConfig);

function tick() {
    remainingSeconds = remainingSeconds - 1;
    if (remainingSeconds <= 0) {
        isStudy = !isStudy;

        if (!isStudy) {
            totalStudyMinutes = totalStudyMinutes + studyMinutes;
            localStorage.setItem("protomoTotal", String(totalStudyMinutes));
            saveSession("study", studyMinutes);
        }

        if (isStudy) {
            saveSession("break", breakMinutes);
            remainingSeconds = studyMinutes * 60;
        } else {
            remainingSeconds = breakMinutes * 60;
        }
    }
    render();
}

function toggleStartPause() {
    const startPauseBtn = document.getElementById('startPauseBtn')
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        startPauseBtn.textContent = "Start"
    } else {
        timerInterval = setInterval(tick, 1000);
        isRunning = true;
        startPauseBtn.textContent = "Pause"
    }
}
document.getElementById('startPauseBtn').addEventListener('click', toggleStartPause);

function render() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    const minuteDigits = String(minutes).padStart(2, '0').split('');
    const secondDigits = String(seconds).padStart(2, '0').split('');

    document.getElementById('timerMinutesTens').textContent = minuteDigits[0];
    document.getElementById('timerMinutesOnes').textContent = minuteDigits[1];
    document.getElementById('timerSecondsTens').textContent = secondDigits[0];
    document.getElementById('timerSecondsOnes').textContent = secondDigits[1];

    document.getElementById("modeLabel").textContent = isStudy ? 'STUDY' : 'BREAK';

    // CHANGES CLASSES SO THAT STUDY AND BREAK HAVE DIFERENT COLORS.    
    const timerDisplay = document.getElementById('timerDisplay');
    const modeLabel = document.getElementById('modeLabel');

    timerDisplay.classList.remove('study-mode', 'break-mode');
    modeLabel.classList.remove('study-mode', 'break-mode');

    if (isStudy) {
        timerDisplay.classList.add('study-mode');
        modeLabel.classList.add('study-mode');
    } else {
        timerDisplay.classList.add('break-mode');
        modeLabel.classList.add('break-mode');
    }

    document.getElementById('startPauseBtn').textContent = isRunning ? 'Pause' : 'Start';
    document.getElementById("todayStudyDisplay").textContent = totalStudyMinutes + " min";
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode'); 
    document.getElementById('themeSwitch').checked = isLight;
    localStorage.setItem('protomoTheme', isLight ? 'light' : 'dark');
}

function toggleMenu() {
    const menu = document.getElementById("themeMenu");
    const toggle = document.getElementById("menuToggle");
    const isOpen = menu.style.display === "block";
    menu.style.display = isOpen ? "none" : "block";
    toggle.classList.toggle("open", !isOpen);
}
document.getElementById("menuToggle").addEventListener("click", toggleMenu);

function syncThemeSwitch() {
    const isLight = document.body.classList.contains('light-mode');
    const switchEl = document.getElementById('themeSwitch');
    if (switchEl) {
        switchEl.checked = isLight;
    }
}
document.getElementById('themeSwitch').addEventListener('change', toggleTheme);

function saveSession(type, duration) {
    const now  = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().slice(0, 5);

    const entry = {
        type : type, 
        duration : duration,
        date : date,
        time : time
    }

    history.push(entry);
    localStorage.setItem("protomoHistory", JSON.stringify(history));
}

const savedTheme = localStorage.getItem("protomoTheme");
if (savedTheme === "light") {
    document.body.classList.add("light-mode");
}


syncThemeSwitch();
render();