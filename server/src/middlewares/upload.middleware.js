import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${req.user?.id || 'anon'}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === 'application/pdf' ||
    path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdf) {
    cb(null, true);
  } else {
    const error = new Error('File must be a PDF');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter,
});

export const handleResumeUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds 5 MB limit',
          details: {},
        });
      }

      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          code: 'INVALID_FILE_TYPE',
          message: 'Not a PDF',
          details: {},
        });
      }

      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: err.message || 'File upload error',
        details: {},
      });
    }

    if (!req.file) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'No file uploaded',
        details: { file: 'PDF resume file is required' },
      });
    }

    next();
  });
};

