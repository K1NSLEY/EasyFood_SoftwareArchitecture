const multer = require('multer');

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      const error = new Error('Formato inválido. Use uma imagem JPEG, PNG ou WebP.');
      error.statusCode = 400;
      return callback(error);
    }
    callback(null, true);
  }
});

function uploadImage(req, res, next) {
  imageUpload.single('image')(req, res, error => {
    if (!error) {
      return next();
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      error.statusCode = 413;
    } else if (error instanceof multer.MulterError) {
      error.statusCode = 400;
    }
    return next(error);
  });
}

module.exports = { uploadImage };
