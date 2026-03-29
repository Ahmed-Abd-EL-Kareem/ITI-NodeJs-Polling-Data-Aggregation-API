const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../user/user.model')
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URL,
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(profile);

      const email = profile.emails[0].value;
      let user = await User.findOne({ email })
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          provider: 'google'
        })
      }
      return done(null, user)
    } catch (err) {
      done(err)
    }
  }
))

module.exports = passport