import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  secure: false, // true para 465, false para outros
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

export async function sendResetPasswordEmail(email, resetLink) {
  const mailOptions = {
    from: config.emailFrom,
    to: email,
    subject: 'Recuperação de senha - Kripta Haus',
    html: `
      <h2>Recuperação de senha</h2>
      <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Este link é válido por 1 hora.</p>
      <p>Se não foi você, ignore este e-mail.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}