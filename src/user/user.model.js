const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "User Must Have Name"],
  },
  email: {
    type: String,
    required: [true, "User Must Have Email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    validate: [validator.isStrongPassword, "The Password Is Week, Pleas Enter Strong one That Have (8 Length Character, 1 UpperCase, 1 LowerCase, 1 Symbol, numbers"],
    required: [true, "User Must Have Password"],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  CreatedAt: Date,
  passwordChangedAt: Date,

},
  {
    timestamps: true
  })

userSchema.pre("save", async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
})
userSchema.methods.passwordCompare = async function (hashedPassword, userPassword) {
  return await bcrypt.compare(userPassword, hashedPassword)
}
const User = mongoose.model("User", userSchema)

module.exports = User;