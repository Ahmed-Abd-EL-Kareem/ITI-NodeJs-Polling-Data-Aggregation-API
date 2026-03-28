const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')

exports.generateResetToken = () => {
  const resetToken = uuidv4()

  const hashToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  return { resetToken, hashToken }
}