const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../../database/prisma');
const imageService = require('../../services/image.service');
const { writeLog } = require('../../services/logger.service');

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function register({ name, email, password }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    const error = new Error('E-mail já cadastrado');
    error.code = 'P2002';
    throw error;
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hash }
  });

  return { id: user.id, name: user.name, email: user.email };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'easyfood-secret-key',
    { expiresIn: '8h' }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email }
  };
}

async function updateAvatar(userId, file) {
  const previousUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true }
  });

  if (!previousUser) {
    throw createError('Usuário não encontrado', 404);
  }

  const avatarUrl = await imageService.storeImage(file);
  let user;
  try {
    user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, name: true, email: true, avatarUrl: true }
    });
  } catch (error) {
    try {
      await imageService.removeImage(avatarUrl);
    } catch (cleanupError) {
      writeLog('error', 'Falha ao remover imagem de perfil temporária', { error: cleanupError.message });
    }
    throw error;
  }

  if (previousUser.avatarUrl && previousUser.avatarUrl !== avatarUrl) {
    try {
      await imageService.removeImage(previousUser.avatarUrl);
    } catch (error) {
      writeLog('error', 'Falha ao remover imagem de perfil anterior', { error: error.message });
    }
  }

  return user;
}

module.exports = { register, login, updateAvatar };
