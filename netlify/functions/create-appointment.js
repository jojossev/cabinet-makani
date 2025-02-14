const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

const MONGODB_URI = process.env.MONGODB_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, email, phone, date, service, message } = data;

    // Connexion à MongoDB
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('cabinet-makani');
    
    // Enregistrer le rendez-vous
    const appointment = {
      name,
      email,
      phone,
      date,
      service,
      message,
      status: 'pending',
      createdAt: new Date()
    };
    
    await db.collection('appointments').insertOne(appointment);

    // Configurer l'envoi d'email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    // Email au client
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Confirmation de votre rendez-vous - Cabinet Makani Marcus',
      html: `
        <h2>Confirmation de votre rendez-vous</h2>
        <p>Cher(e) ${name},</p>
        <p>Nous avons bien reçu votre demande de rendez-vous pour le ${date}.</p>
        <p>Service demandé : ${service}</p>
        <p>Nous vous contacterons prochainement pour confirmer le rendez-vous.</p>
        <p>Cordialement,<br>Cabinet Me Mwamikedi Makani Marcus & Associés</p>
      `
    });

    // Email au cabinet
    await transporter.sendMail({
      from: EMAIL_USER,
      to: 'contact@cabinet-makani-marcus.com',
      subject: 'Nouvelle demande de rendez-vous',
      html: `
        <h2>Nouvelle demande de rendez-vous</h2>
        <p><strong>Client :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${phone}</p>
        <p><strong>Date souhaitée :</strong> ${date}</p>
        <p><strong>Service :</strong> ${service}</p>
        <p><strong>Message :</strong> ${message}</p>
      `
    });

    await client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Rendez-vous enregistré avec succès' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Une erreur est survenue' })
    };
  }
};
