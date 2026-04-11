const crypto = require('crypto')

exports.generateResetToken = () => {
  const resetToken = crypto.randomUUID()

  const hashToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  return { resetToken, hashToken }
}