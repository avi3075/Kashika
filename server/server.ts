import 'dotenv/config'; // Load env vars first
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { computeDimensions, mockRepairMesh } from './meshProcessing';
import { analyzeWithGemini, generateImage, editImage } from './geminiService';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
// Increase limit for image uploads (base64 or form data)
// cast to any to avoid strict type mismatch with NextHandleFunction
app.use(express.json({ limit: '50mb' }) as any);

// Static files (to serve uploads and repaired files)
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const REPAIRED_DIR = path.join(process.cwd(), 'repaired');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(REPAIRED_DIR)) fs.mkdirSync(REPAIRED_DIR, { recursive: true });

// cast to any to avoid strict type mismatch
app.use('/uploads', express.static(UPLOADS_DIR) as any);
app.use('/repaired', express.static(REPAIRED_DIR) as any);

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
});
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// In-memory database (for demo purposes)
const modelsDb: Record<string, any> = {};

// --- ROUTES ---

// 1. Upload
const uploadHandler = (req: Request, res: Response, next: NextFunction) => {
  const reqWithFile = req as any;
  if (!reqWithFile.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const id = uuidv4();
  const filePath = reqWithFile.file.path;
  
  // Basic Metadata Init
  modelsDb[id] = {
    id,
    filename: reqWithFile.file.originalname,
    originalFilePath: `/uploads/${reqWithFile.file.filename}`,
    localPath: filePath,
    uploadDate: new Date(),
    status: 'uploaded',
    dimensions: null 
  };

  res.json(modelsDb[id]);
};

// cast middleware to any
app.post('/api/upload', upload.single('model') as any, uploadHandler);

// 2. Get Metadata (Compute dims if missing)
const getMetadataHandler = async (req: Request, res: Response, next: NextFunction) => {
  const model = modelsDb[req.params.id];
  if (!model) {
    res.status(404).json({ error: 'Model not found' });
    return;
  }

  // Compute dimensions only once
  if (!model.dimensions) {
    try {
      const dims = await computeDimensions(model.localPath);
      model.dimensions = dims;
    } catch (err) {
      console.error("Error computing dimensions:", err);
      // Fallback dims
      model.dimensions = { height: 0, width: 0, depth: 0, units: 'cm' };
    }
  }

  res.json(model);
};

app.get('/api/model/:id/metadata', getMetadataHandler);

// 3. Repair
const repairHandler = async (req: Request, res: Response, next: NextFunction) => {
  const model = modelsDb[req.params.id];
  if (!model) {
    res.status(404).json({ error: 'Model not found' });
    return;
  }

  model.status = 'repairing';
  const { mode } = req.body;

  try {
    // 1. Call Gemini for Analysis
    const geminiAnalysis = await analyzeWithGemini({
      filename: model.filename,
      dimensions: model.dimensions || { width: 0, height: 0, depth: 0 },
      mode
    });

    // 2. Perform Geometry Repair (Mocked logic)
    const repairedFilename = `repaired-${path.basename(model.localPath)}`;
    const repairedLocalPath = path.join(REPAIRED_DIR, repairedFilename);
    
    await mockRepairMesh(model.localPath, repairedLocalPath);

    // Update DB
    model.repairedFilePath = `/repaired/${repairedFilename}`;
    model.status = 'repaired';
    model.aiSuggestion = geminiAnalysis;

    res.json({
      id: model.id,
      repairedFilePath: model.repairedFilePath,
      message: "Repair successful",
      aiAnalysis: geminiAnalysis
    });

  } catch (err) {
    console.error(err);
    model.status = 'failed';
    res.status(500).json({ error: 'Repair failed' });
  }
};

app.post('/api/model/:id/repair', repairHandler);

// 4. Studio - Generate Image
const generateImageHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, aspectRatio } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }
    const result = await generateImage(prompt, aspectRatio);
    res.json(result);
  } catch (error) {
    console.error("Generate error:", error);
    res.status(500).json({ error: 'Image generation failed' });
  }
};
app.post('/api/studio/generate', generateImageHandler);

// 5. Studio - Edit Image
const editImageHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This expects a JSON body with { image: "base64...", prompt: "..." }
    // For large images, this might hit body parser limits, ensure express.json limit is high enough
    const { image, prompt } = req.body;
    if (!image || !prompt) {
      res.status(400).json({ error: 'Image and prompt are required' });
      return;
    }
    
    // image is expected to be a data URL, strip prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/png';
    
    const result = await editImage(base64Data, mimeType, prompt);
    res.json(result);
  } catch (error) {
    console.error("Edit error:", error);
    res.status(500).json({ error: 'Image editing failed' });
  }
};
app.post('/api/studio/edit', editImageHandler);


// Bind to 0.0.0.0 to ensure it listens on all interfaces (fixes some localhost issues)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});