const nodemailer = require('nodemailer');
var SENDGRID_API_KEY =
  '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';
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return sgMail;
    }
    return nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: 'bc811c2c65bdf7',
        pass: '36108d8e7a4eb9',
      },
    });
  }

  // Send the actual email
  async send(html, subject) {
    // 2) Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: this.to,
      subject,
      html,
    };
    if (process.env.NODE_ENV === 'production') {
      await this.newTransport().send(mailOptions);
    }
    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset(html) {
    await this.send(
      html,
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
