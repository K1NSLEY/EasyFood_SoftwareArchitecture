const nodemailer = require('nodemailer');
const { writeLog } = require('./logger.service');

const commercialEmail = process.env.COMMERCIAL_EMAIL || 'kinsbrasil@gmail.com';

function createEmailTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('SMTP não configurado: preencha EMAIL_USER e EMAIL_PASS no arquivo .env');
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

async function sendWelcomeEmail(restaurant) {
  try {
    const transporter = createEmailTransporter();
    const info = await transporter.sendMail({
      from: `EasyFood <${process.env.EMAIL_USER}>`,
      to: restaurant.email,
      subject: 'Bem-vindo ao EasyFood',
      text: `Olá ${restaurant.name}! Seu restaurante foi cadastrado com sucesso no EasyFood.`
    });

    writeLog('info', 'E-mail de boas-vindas enviado', {
      email: restaurant.email,
      messageId: info.messageId
    });
  } catch (error) {
    writeLog('error', 'Não foi possível enviar o e-mail de boas-vindas', {
      email: restaurant.email,
      error: error.message
    });
  }
}

async function notifyCommercialTeam(restaurant) {
  try {
    const transporter = createEmailTransporter();
    const info = await transporter.sendMail({
      from: `EasyFood <${process.env.EMAIL_USER}>`,
      to: commercialEmail,
      subject: `Novo restaurante cadastrado: ${restaurant.name}`,
      text: [
        'Um novo restaurante foi cadastrado no EasyFood.',
        `Nome: ${restaurant.name}`,
        `E-mail: ${restaurant.email}`,
        `Categoria: ${restaurant.category}`,
        `Avaliação: ${restaurant.rating}`
      ].join('\n')
    });

    writeLog('info', 'Notificação enviada ao time comercial por e-mail', {
      email: commercialEmail,
      restaurant: restaurant.name,
      messageId: info.messageId
    });
  } catch (error) {
    writeLog('error', 'Erro ao enviar notificação comercial por e-mail', {
      email: commercialEmail,
      error: error.message
    });
  }
}

module.exports = { sendWelcomeEmail, notifyCommercialTeam };
