import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config()
// Create a transporter object using the default SMTP transport
const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail', // or use a different email service
  auth: {
    user: process.env.EMAIL_USER, // your Gmail email address
    pass: process.env.EMAIL_PASS, // your Gmail app password
  },
});

// Function to send an email
export const sendEmail = async (
  to: string,
  subject: string,
  text: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};