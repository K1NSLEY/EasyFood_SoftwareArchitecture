const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../../database/prisma');

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

module.exports = { register, login };
