const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const uploadDirectory = path.join(__dirname, '..', '..', 'public', 'uploads');
const formatByMimeType = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp'
};

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function storeImage(file) {
  const expectedFormat = file && formatByMimeType[file.mimetype];
  if (!expectedFormat || !Buffer.isBuffer(file.buffer)) {
    throw createError('Envie uma imagem JPEG, PNG ou WebP válida', 400);
  }

  let optimizedImage;
  try {
    const image = sharp(file.buffer, { limitInputPixels: 40000000 });
    const metadata = await image.metadata();

    if (metadata.format !== expectedFormat) {
      throw createError('O conteúdo do arquivo não corresponde ao formato informado', 400);
    }

    optimizedImage = await image
      .rotate()
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw createError('O conteúdo do arquivo não é uma imagem válida', 400);
  }

  await fs.promises.mkdir(uploadDirectory, { recursive: true });
  const filename = `${crypto.randomUUID()}.webp`;
  await fs.promises.writeFile(path.join(uploadDirectory, filename), optimizedImage, { flag: 'wx' });
  return `/uploads/${filename}`;
}

async function removeImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
    return;
  }

  const filename = path.basename(imageUrl);
  try {
    await fs.promises.unlink(path.join(uploadDirectory, filename));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = { storeImage, removeImage };
