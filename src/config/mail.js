
const sgMail = require('@sendgrid/mail')
const catchAsync = require('../utils/catchAsync')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.sendEmail = catchAsync(async ({ to, subject, html }) => {
  const msg = {
    to,
    from: process.env.EMAIL_FROM,
    subject,
    html
  }
  await sgMail.send(msg)
})