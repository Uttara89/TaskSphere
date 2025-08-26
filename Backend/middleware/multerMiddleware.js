const multer  = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Choose a temp directory that's safe for ephemeral filesystems (e.g., Render)
const uploadDir = process.env.UPLOAD_TMP_DIR 
  ? path.resolve(process.env.UPLOAD_TMP_DIR)
  : path.join(os.tmpdir(), 'tasksphere-uploads');

// Ensure the directory exists at runtime
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  // Pass absolute path to avoid cwd issues in production
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  }
});

const upload = multer({ storage });

module.exports = { upload };