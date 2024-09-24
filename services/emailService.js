const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendResetPasswordEmail = async (email, token) => {
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset',
    // html: `
    //   <p>You requested a password reset</p>
    //   <p>Click this <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">link</a> to set a new password.</p>
    // `,
    html: `
    <p>You requested a password reset</p>
    <p>Click this <a href="example.com/reset-password?token=${token}">link</a> to set a new password.</p>
    <p>
    Token = ${token}
    </p>
  `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendInvoiceEmail = async (email, pdfBuffer) => {

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your Invoice',
    text: 'Please find attached your invoice.',
    attachments: [
      {
        filename: 'invoice.pdf',
        content: pdfBuffer,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};