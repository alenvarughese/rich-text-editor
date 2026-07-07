import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Ensure the uploads directory exists at startup
const uploadDir = join(__dirname, '..', '..', 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Controller('upload-image')
export class UploadController {
  // POST /upload-image
  // This endpoint is what Editor.js Image tool calls when the user picks a file.
  // Editor.js sends a multipart/form-data POST with the file under field name "image".
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {    // 'image' = the form field name Editor.js uses
      storage: diskStorage({
        destination: uploadDir,   // Save files to backend/uploads/
        filename: (_req, file, cb) => {
          // Unique filename: timestamp + original extension (e.g. 1719999999999.jpg)
          const uniqueName = `${Date.now()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, cb) => {
        // Only allow common image types
        const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (!allowed.test(extname(file.originalname))) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    }),
  )
  uploadImage(req, res) {
    // Multer attaches the uploaded file to req.file when using FileInterceptor
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: 0, message: 'No file uploaded' });
    }

    // Editor.js Image tool expects this EXACT JSON shape on success:
    // { success: 1, file: { url: "..." } }
    // The url must be publicly accessible so the editor can display the image.
    const url = `http://localhost:3001/uploads/${file.filename}`;
    return res.json({
      success: 1,
      file: { url },
    });
  }
}
