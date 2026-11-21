# AccessCheck AI

**Make Every Word Accessible to Everyone.**

AccessCheck AI is a lightweight, minimalist web application built for the **STEM2Connect AI Hackathon 2026 (Community Impact Track)**. It helps students, parents, and community members easily understand complex school notices, circulars, and dense announcements without losing critical dates, deadlines, or instructions.

---

## 🌟 Features

* **AI-Powered Simplification:** Transforms complicated, formal paragraphs into clear, easy-to-digest information while strictly preserving important details like dates, times, and requirements.
* **Readability Score (1–10):** Provides an instant AI-estimated score and brief explanation showing how approachable the original text is.
* **Dyslexia-Friendly Reading Mode:** Formats simplified text with shorter paragraphs, highlighted keywords, and a **Crisp White / Soft Cream** background toggle to reduce visual stress.
* **Screen-Reader Script & Audio Playback:** Generates a natural, conversational script and utilizes browser `SpeechSynthesis` so users can listen to notices hands-free.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend:** Node.js serverless function (`api/accessibility.js`) deployed on Vercel
* **AI Integration:** Google Gemini API (`gemini-3.5-flash` with multi-model fallback support)
* **Audio:** Web Speech API (`SpeechSynthesis`)

---

## 🚀 How to Run & Test

### Live Demo
You can test the live deployed application directly via the Vercel link provided in the project submission. Simply paste any complex school notice (or click **"+ Load sample complex notice"**) and click **Make Accessible**.

### Local Setup
1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd <repository-folder>
