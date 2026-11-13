const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const sourcePath = path.resolve(
  process.cwd(),
  process.env.SQLITE_DATABASE_PATH || path.join('prisma', 'dev.db')
);
const dryRun = process.argv.includes('--dry-run');
const tables = [
  {
    name: 'User',
    fields: ['id', 'name', 'email', 'password', 'avatarUrl', 'createdAt', 'updatedAt']
  },
  {
    name: 'Restaurant',
    fields: ['id', 'name', 'email', 'category', 'rating', 'ownerId', 'createdAt', 'updatedAt']
  },
  {
    name: 'Dish',
    fields: ['id', 'name', 'category', 'price', 'description', 'imageUrl', 'restaurantId', 'createdAt', 'updatedAt']
  },
  {
    name: 'Activity',
    fields: ['id', 'action', 'details', 'userId', 'createdAt']
  }
];

function readSourceRows() {
  const sqlite = new DatabaseSync(sourcePath, { readOnly: true });

  try {
    return tables.map(({ name, fields }) => {
      const availableFields = new Set(
        sqlite.prepare(`PRAGMA table_info("${name}")`).all().map(column => column.name)
      );
      const missingFields = fields.filter(field => !availableFields.has(field));

      if (missingFields.length) {
        throw new Error(`A tabela ${name} não contém as colunas esperadas: ${missingFields.join(', ')}`);
      }

      const columns = fields.map(field => `"${field}"`).join(', ');
      const rows = sqlite.prepare(`SELECT ${columns} FROM "${name}" ORDER BY "id"`).all();

      return {
        name,
        rows: rows.map(row => {
          const mappedRow = { ...row };
          for (const field of ['createdAt', 'updatedAt']) {
            if (mappedRow[field] !== undefined && mappedRow[field] !== null) {
              const rawValue = mappedRow[field];
              if (typeof rawValue === 'number' || /^\d+$/.test(String(rawValue))) {
                mappedRow[field] = new Date(Number(rawValue));
              } else {
                const value = String(rawValue);
                const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
                mappedRow[field] = new Date(hasTimezone ? value : `${value}Z`);
              }
              if (Number.isNaN(mappedRow[field].getTime())) {
                throw new Error(`Data inválida em ${name}.${field}, registro ${row.id}`);
              }
            }
          }
          return mappedRow;
        })
      };
    });
  } finally {
    sqlite.close();
  }
}

async function migrate(rows) {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
    throw new Error('Configure DATABASE_URL com uma conexão PostgreSQL válida antes da migração.');
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$connect();

    await prisma.$transaction(async transaction => {
      const destinationCounts = await Promise.all([
        transaction.user.count(),
        transaction.restaurant.count(),
        transaction.dish.count(),
        transaction.activity.count()
      ]);

      if (destinationCounts.some(count => count > 0)) {
        throw new Error('O PostgreSQL de destino não está vazio. A migração foi cancelada para evitar duplicação ou sobrescrita.');
      }

      for (const { name, rows: tableRows } of rows) {
        if (tableRows.length) {
          await transaction[name.toLowerCase()].createMany({ data: tableRows });
        }
      }

      for (const { name } of tables) {
        await transaction.$queryRawUnsafe(
          `SELECT setval(pg_get_serial_sequence('"${name}"', 'id'), COALESCE(MAX("id"), 1), MAX("id") IS NOT NULL) FROM "${name}"`
        );
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const rows = readSourceRows();
  console.log(`Fonte SQLite: ${sourcePath}`);
  for (const { name, rows: tableRows } of rows) {
    console.log(`${name}: ${tableRows.length} registros`);
  }

  if (dryRun) {
    console.log('Simulação concluída; nenhum dado foi gravado.');
    return;
  }

  await migrate(rows);
  console.log('Migração concluída. A origem SQLite foi mantida intacta.');
}

main().catch(error => {
  console.error(`Falha na migração: ${error.message}`);
  process.exitCode = 1;
});
