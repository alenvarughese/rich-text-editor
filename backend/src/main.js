import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join, extname } from 'path';
import { Router, json as expressJson } from 'express';
import { NotesService } from './notes/notes.service';
import { existsSync, mkdirSync } from 'fs';

// multer is a CommonJS module; Babel's interopRequireDefault handles this
import multerPkg from 'multer';
const multer = multerPkg.default || multerPkg;

// ─────────────────────────────────────────────────────────────────────────────
// WHY WE USE EXPRESS ROUTES DIRECTLY HERE
// ─────────────────────────────────────────────────────────────────────────────
// In plain JavaScript NestJS (without TypeScript), Babel's legacy decorator
// transform cannot handle PARAMETER decorators like @Body(), @Param(), @Req().
// These are needed in NestJS controllers to inject request data.
//
// Solution: we keep NestJS for everything it's great at —
//   • TypeORM entity management & the "notes" table
//   • Dependency injection (NotesService)
//   • Module system
//   • Static file serving
//
// But we register the actual HTTP routes as plain Express middleware on the
// underlying Express app that NestJS uses internally. This gives us the full
// req.body / req.params access without any parameter decorators.
// ─────────────────────────────────────────────────────────────────────────────

const uploadDir = join(__dirname, '..', 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

// Multer config — saves images to backend/uploads/ with unique timestamped names
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (!allowed.test(extname(file.originalname))) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ─────────────────────────────────────────────────────────────────
  // Allow the React dev server (port 5173) to make requests to this API
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  // ── STATIC FILES ─────────────────────────────────────────────────────────
  // Serve uploaded images so they can be embedded in notes
  // URL pattern: http://localhost:3001/uploads/<filename>
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  // ── NOTES ROUTES ─────────────────────────────────────────────────────────
  // Retrieve the NotesService from NestJS's DI container.
  // All database logic (TypeORM queries) lives in NotesService — we just
  // call it from plain Express route handlers below.
  const notesService = app.get(NotesService);
  const notesRouter = Router();

  // Apply JSON body parser so req.body is populated for POST/PUT requests
  notesRouter.use(expressJson());

  // GET /notes — list all notes (id, title, created_at only)
  notesRouter.get('/', async (_req, res) => {
    try {
      const notes = await notesService.findAll();
      res.json(notes);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  // POST /notes — create a note
  // Body: { title: string, content: object }  (content = Editor.js JSON)
  notesRouter.post('/', async (req, res) => {
    try {
      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: 'title and content are required' });
      }
      const note = await notesService.create({ title, content });
      res.status(201).json(note);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  // GET /notes/:id — get a single note with full Editor.js JSON content
  notesRouter.get('/:id', async (req, res) => {
    try {
      const note = await notesService.findOne(parseInt(req.params.id, 10));
      res.json(note);
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  });

  // PUT /notes/:id — update title and/or content
  notesRouter.put('/:id', async (req, res) => {
    try {
      const note = await notesService.update(parseInt(req.params.id, 10), req.body);
      res.json(note);
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  });

  // DELETE /notes/:id
  notesRouter.delete('/:id', async (req, res) => {
    try {
      const result = await notesService.remove(parseInt(req.params.id, 10));
      res.json(result);
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  });

  app.use('/notes', notesRouter);

  // ── IMAGE UPLOAD ROUTE ───────────────────────────────────────────────────
  // POST /upload-image
  // Editor.js Image tool calls this endpoint when a user selects an image file.
  // It sends a multipart/form-data POST with the file under field name "image".
  //
  // We MUST return: { success: 1, file: { url } }
  // The URL must be publicly accessible — served via the /uploads static route.
  app.use('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: 0, message: 'No file uploaded' });
    }
    const url = `http://localhost:3001/uploads/${req.file.filename}`;
    res.json({ success: 1, file: { url } });
  });

  // ── START SERVER ─────────────────────────────────────────────────────────
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`✅  Backend running on http://localhost:${port}`);
  console.log(`    API:     http://localhost:${port}/notes`);
  console.log(`    Upload:  http://localhost:${port}/upload-image`);
  console.log(`    Images:  http://localhost:${port}/uploads/<filename>`);
}

bootstrap();
