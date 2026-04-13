const sgMail = require('@sendgrid/mail')
const nodemailer = require('nodemailer')
const catchAsync = require('../utils/catchAsync')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// ! Using SenGrid Mail Server (Production)
exports.sendEmail = catchAsync(async ({ to, subject, html }) => {
  const msg = {
    to,
    from: process.env.EMAIL_FROM,
    subject,
    html
  }
  await sgMail.send(msg)
})

// ? Using MailTrap Mail Server (Development)
const sendMailTrap = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    }
  })

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to,
    subject,
    html
  }

  await transporter.sendMail(mailOptions)
}

// * Using NodeMailer Only (Custom SMTP)
const sendNodeMailer = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Or another service, relies on SMTP settings
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  })

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html
  }

  await transporter.sendMail(mailOptions)
}

module.exports = { 
  sendEmail: exports.sendEmail, 
  sendMailTrap, 
  sendNodeMailer 
}