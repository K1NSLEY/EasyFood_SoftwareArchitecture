const prisma = require('../../database/prisma');

async function log(userId, action, details) {
  return prisma.activity.create({
    data: { userId, action, details }
  });
}

async function listForUser(userId) {
  return prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
}

module.exports = { log, listForUser };
