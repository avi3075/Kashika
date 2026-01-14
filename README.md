# PotFix 3D

A web application for scanning (via KIRI Engine), viewing, and repairing 3D clay pot models using AI-assisted mesh processing.

## Tech Stack
- **Frontend**: React, Three.js (React Three Fiber), Tailwind CSS, Vite
- **Backend**: Node.js, Express, Multer
- **AI**: Google Gemini API (Analysis & Strategy)

## Prerequisites
- Node.js (v18+)
- A Google Gemini API Key (for AI features)

## Setup & Installation

### 1. Install Dependencies
This project contains both client and server code. You need to install packages for both.

**Root (Client) Dependencies:**
```bash
npm install react react-dom react-router-dom three @types/three @react-three/fiber @react-three/drei lucide-react clsx tailwind-merge
npm install -D vite @vitejs/plugin-react typescript @types/react @types/node autoprefixer postcss tailwindcss
```

**Server Dependencies:**
```bash
npm install express cors multer uuid @google/genai dotenv
npm install -D @types/express @types/cors @types/multer @types/uuid ts-node
```

### 2. Configure Backend
1. Create a `.env` file in the root:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

### 3. Running the App

**Start the Backend (Terminal 1):**
```bash
# Using ts-node to run directly
npx ts-node server/server.ts
```
*Server runs on http://localhost:3001*

**Start the Frontend (Terminal 2):**
```bash
npm run dev
# OR
npx vite
```
*Client runs on http://localhost:3000*

## Usage Guide
1. **Scan**: Use KIRI Engine App to scan a pot. Export as `.obj`.
2. **Upload**: Go to `/upload`, drop the `.obj` file.
3. **View**: Rotate and inspect the model. Note the dimensions.
4. **Repair**: Click "Auto Repair Mesh". The server calculates bounds and simulates a repair process while Gemini generates an analysis log.
5. **Download**: Get the fixed file.

## Folder Structure
- `/server`: Node.js API and mesh processing logic.
- `/pages`: React route pages.
- `/components`: Reusable UI and 3D components.
- `/uploads`: Temporary storage for uploaded models.
- `/repaired`: Storage for processed output.
