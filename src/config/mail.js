
const sgMail = require('@sendgrid/mail')
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

const nodemailer = require('nodemailer')

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
module.exports = sendMailTrap;