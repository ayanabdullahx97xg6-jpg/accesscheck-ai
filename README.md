# AccessCheck AI

A two-page accessibility web app for the STEM2Connect AI Hackathon 2026 — Community Impact Track.

## Features
- Landing page at `/`
- Tool page at `/tool`
- Gemini-powered readability estimate, dyslexia-friendly rewrite, and screen-reader script
- Cream / white reading background toggle
- Browser Text-to-Speech play / stop
- Copy buttons for each output
- Responsive black-and-white interface

## Run locally
1. Install Node.js (18+ recommended).
2. Open this folder in a terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and add your Gemini API key:
   `GEMINI_API_KEY=your_key_here`
5. Run `npm run dev` and open the local URL printed by Vercel.

## Deploy to Vercel
1. Push this project to a GitHub repository.
2. Import that repository in Vercel.
3. In Vercel → Project → Settings → Environment Variables, add:
   - Name: `GEMINI_API_KEY`
   - Value: your Gemini API key
   - Environments: Production, Preview, Development
4. Redeploy the project.

The API key is read only by the serverless function and is not included in browser code. Never commit `.env` or paste your API key into public source files.

## Notes
- The readability score is an AI-generated estimate, not a formal or validated readability metric.
- Always verify dates, names, deadlines, amounts, and instructions in AI-transformed notices before publishing.
- If your Google AI Studio account/model access differs, update the model name in `api/accessibility.js`.
