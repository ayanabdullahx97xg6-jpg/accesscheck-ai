const sourceText = document.getElementById("sourceText");
const charCount = document.getElementById("charCount");
const sampleBtn = document.getElementById("sampleBtn");
const makeBtn = document.getElementById("makeBtn");
const statusEl = document.getElementById("status");
const results = document.getElementById("results");
const listenBtn = document.getElementById("listenBtn");
let currentSpeech = null;

const sampleNotice = `NOTICE TO ALL STUDENTS AND PARENTS

Pursuant to the administration's revised scheduling arrangements, the annual science exhibition, which was previously communicated as taking place on Thursday, has been rescheduled to Friday, 18 December 2026, due to unforeseen maintenance work in the school auditorium.

All participating students are required to report to the main school entrance no later than 8:15 AM. Students must bring their completed project displays, identification cards, and any presentation materials that were approved by their respective subject teachers. Parents and guardians are advised that visitor entry will commence at 9:30 AM, subject to verification at the reception desk.

Please be advised that transportation arrangements will remain unchanged. In the event of any further amendments, the school administration will disseminate an updated notification through the official communication channels. For clarification, contact the school office during regular working hours.`;

sourceText.addEventListener("input", () => {
  charCount.textContent = `${sourceText.value.length.toLocaleString()} / 15,000`;
});

sampleBtn.addEventListener("click", () => {
  sourceText.value = sampleNotice;
  sourceText.dispatchEvent(new Event("input"));
  sourceText.focus();
  setStatus("Sample notice loaded. Select “Make Accessible” when you're ready.", "success");
});

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function renderParagraphs(target, text, allowBold = false) {
  target.replaceChildren();
  const blocks = String(text).trim().split(/\n\s*\n/).filter(Boolean);
  for (const block of blocks) {
    const p = document.createElement("p");
    if (allowBold) {
      const pieces = block.split(/(\*\*[^*]+\*\*)/g);
      for (const piece of pieces) {
        if (piece.startsWith("**") && piece.endsWith("**")) {
          const strong = document.createElement("strong");
          strong.textContent = piece.slice(2, -2);
          p.append(strong);
        } else {
          p.append(document.createTextNode(piece));
        }
      }
    } else {
      p.textContent = block;
    }
    target.append(p);
  }
}

makeBtn.addEventListener("click", async () => {
  const text = sourceText.value.trim();
  if (text.length < 20) {
    setStatus("Please paste at least 20 characters first.", "error");
    sourceText.focus();
    return;
  }

  makeBtn.disabled = true;
  makeBtn.innerHTML = '<span class="spinner" aria-hidden="true">◌</span> Processing…';
  setStatus("Analysing your text and creating accessible versions…", "loading");
  results.hidden = true;
  stopSpeech();

  try {
    const response = await fetch("/api/accessibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");

    document.getElementById("scoreValue").textContent = data.readabilityScore;
    document.getElementById("scoreExplanation").textContent = data.scoreExplanation;
    document.getElementById("scoreMeter").style.width = `${data.readabilityScore * 10}%`;
    renderParagraphs(document.getElementById("dyslexiaOutput"), data.dyslexiaFriendly, true);
    renderParagraphs(document.getElementById("screenReaderOutput"), data.screenReaderScript);
    results.hidden = false;
    setStatus("Your accessible versions are ready.", "success");
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    setStatus(error.message || "Unable to process this text. Please try again.", "error");
  } finally {
    makeBtn.disabled = false;
    makeBtn.innerHTML = 'Make Accessible <span>✦</span>';
  }
});

document.querySelectorAll(".theme-choice").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".theme-choice").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    document.getElementById("dyslexiaOutput").classList.toggle("cream", button.dataset.theme === "cream");
  });
});

document.querySelectorAll(".copy-button").forEach(button => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copy);
    const text = target.innerText.trim();
    try {
      await navigator.clipboard.writeText(text);
      const original = button.innerHTML;
      button.textContent = "Copied ✓";
      setTimeout(() => button.innerHTML = original, 1500);
    } catch {
      setStatus("Clipboard access was blocked by your browser. You can select and copy the text manually.", "error");
    }
  });
});

function stopSpeech() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  currentSpeech = null;
  listenBtn.innerHTML = '<span id="listenIcon">▶</span> <span id="listenLabel">Listen</span>';
}

listenBtn.addEventListener("click", () => {
  if (!("speechSynthesis" in window)) {
    setStatus("Text-to-speech is not supported by this browser.", "error");
    return;
  }
  if (window.speechSynthesis.speaking) {
    stopSpeech();
    return;
  }
  const text = document.getElementById("screenReaderOutput").innerText.trim();
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.onend = stopSpeech;
  utterance.onerror = stopSpeech;
  currentSpeech = utterance;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  listenBtn.innerHTML = '<span>■</span> <span>Stop listening</span>';
});

document.getElementById("resetBtn").addEventListener("click", () => {
  stopSpeech();
  results.hidden = true;
  sourceText.value = "";
  sourceText.dispatchEvent(new Event("input"));
  setStatus("");
  sourceText.focus();
});

window.addEventListener("beforeunload", stopSpeech);