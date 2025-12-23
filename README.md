# Magic Restorer

AI-powered photo restoration web app built with TanStack Start + React and deployed on Netlify. Upload an old photo, the app sends it to a Netlify Function that calls Google Gemini image generation, then returns a restored image for download.

## Features

- Drag-and-drop or click-to-upload image restore flow
- Serverless restore endpoint at `/.netlify/functions/restore`
- Uses Google Gemini (`gemini-2.5-flash-image`) to generate a restored image
- Result page with in-browser download (no server-side persistence)

## Tech Stack

- TanStack Start + TanStack Router
- React + TypeScript + Vite
- Netlify Functions
- Google GenAI SDK (`@google/genai`)

## Prerequisites

- Node.js 22+
- A Google Gemini API key

## Local Development

Install dependencies:

```bash
npm install
```

Set the required environment variable:

```bash
export GEMINI_API_KEY="your_api_key"
```

Run locally with Netlify (recommended, includes Functions emulation):

```bash
netlify dev
```

Then open `http://localhost:8888`.

Notes:
- `npm run dev` starts Vite on port `3000`, but Netlify Functions won’t be available there unless separately proxied.
- The app calls `/.netlify/functions/restore`, which works automatically under `netlify dev` and on Netlify deploys.

## API

### `POST /.netlify/functions/restore`

Accepts `multipart/form-data`:

- `image` (required): the uploaded image file
- `prompt` (optional): custom restoration prompt (defaults to a “vintage photo restoration” prompt)

Example:

```bash
curl -sS \
  -X POST "http://localhost:8888/.netlify/functions/restore" \
  -F "image=@./photo.jpg" \
  | jq .
```

Successful responses include:

- `success: true`
- `imageUrl`: a `data:` URL containing the restored image
- `text`: any text returned by the model (may be empty)
- `model`: the model used

## Deployment (Netlify)

This repo is already configured for Netlify:

- Build command: `npm run build`
- Publish directory: `dist/client` (see `netlify.toml`)

Add the environment variable in Netlify:

- `GEMINI_API_KEY`

## Troubleshooting

- **`API key not configured`**: ensure `GEMINI_API_KEY` is set for local (`netlify dev`) and in Netlify environment variables for deploys.
- **`No image was generated` (HTTP 422)**: Gemini returned no image part; try a different photo or adjust the prompt.
- **Long processing time**: image generation can take ~15–30 seconds depending on model and load.

## Security & Privacy Notes

- Uploaded images are sent to Google Gemini via the Netlify Function.
- The restored image is returned to the browser as a `data:` URL and stored temporarily in `sessionStorage` for navigation; it is removed after the result page loads.

