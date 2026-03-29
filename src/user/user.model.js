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
    validate: {
      validator: function (val) {
        return validator.isStrongPassword(val, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        });
      },
      message:
        'Password must contain uppercase, lowercase, number and symbol',
    },
    minlength: 8,
    // required: [true, "User Must Have Password"],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  passwordChangedAt: Date,
  CreatedAt: Date,

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