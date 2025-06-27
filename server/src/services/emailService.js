const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const emailService = {
  async sendVerificationEmail(user) {
    const verificationToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify your BlueFish Sports account',
      html: `
        <h1>Welcome to BlueFish Sports!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      await pool.query(
        'UPDATE users SET verification_token = $1 WHERE id = $2',
        [verificationToken, user.id]
      );
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  },

  async verifyEmail(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await pool.query(
        'UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1 AND verification_token = $2 RETURNING *',
        [decoded.id, token]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired verification token');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }
};

module.exports = emailService; 