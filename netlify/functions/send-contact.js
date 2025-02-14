const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, email, phone, subject, message } = data;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    // Email au cabinet
    await transporter.sendMail({
      from: EMAIL_USER,
      to: 'contact@cabinet-makani-marcus.com',
      subject: `Nouveau message de contact: ${subject}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>De :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${phone}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <p><strong>Message :</strong> ${message}</p>
      `
    });

    // Email de confirmation au client
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Confirmation de votre message - Cabinet Makani Marcus',
      html: `
        <h2>Confirmation de votre message</h2>
        <p>Cher(e) ${name},</p>
        <p>Nous avons bien reçu votre message et nous vous en remercions.</p>
        <p>Nous vous répondrons dans les plus brefs délais.</p>
        <p>Cordialement,<br>Cabinet Me Mwamikedi Makani Marcus & Associés</p>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Message envoyé avec succès' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Une erreur est survenue' })
    };
  }
};
