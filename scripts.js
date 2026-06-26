function toggleSettings() {
    const panel = document.getElementById("settingsPanel");
    if (panel.style.display === "none") {
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }
}

document.getElementById("settingsToggle").addEventListener("click", toggleSettings);

function applyConfig() {
    const newStudy = parseInt(document.getElementById("studyInput").value);
    const newBreak = parseInt(document.getElementById("breakInput").value);

    if (isNaN(newStudy) || newStudy < 1) { return; }
    if (isNaN(newBreak) || newBreak < 1) { return; }

    studyMinutes = newStudy;
    breakMinutes = newBreak;

    if (isRunning === false) {
        remainingSeconds = studyMinutes * 60;
        isStudy = true;
    }
    render();
    document.getElementById('settingsPanel').style.display = 'none';
}