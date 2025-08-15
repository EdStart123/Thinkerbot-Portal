# Thinkerbot Portal
Single‑file React app (Vite + Tailwind) matching the Thinkeringlabs comps. Includes:
- Profile wizard (3 steps)
- My Journey (loads from your API or sample data)
- Network (keyword‑based partner suggestions + hover detail)
- Resources (Brand Assets editor with Dropbox‑friendly URLs)
- Thinkerbot chat (hover‑to‑open, click‑away reduce, optional vision via html2canvas + OpenAI)

## Quick start
```bash
npm i
npm run dev
```

## Optional: OpenAI key
Create a `.env` file at the project root:
```env
VITE_OPENAI_API_KEY=sk-your-key
```
You can also click the gear in the chat and paste a key, which is stored in `localStorage` only.

## Dropbox assets
Use **Resources → Brand Assets** inside the app.
- Convert Dropbox links to `?raw=1` or `dl.dropboxusercontent.com/...`
- Paste URLs for logo cloud, sidebar pattern, corner shapes, header icons
- Override network avatars via JSON map by profile id
