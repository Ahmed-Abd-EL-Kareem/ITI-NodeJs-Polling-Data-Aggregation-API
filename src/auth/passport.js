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
      const email = profile.emails[0].value;
      const googlePhotoUrl = profile.photos?.[0]?.value || null;
      let user = await User.findOne({ email })
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          image: googlePhotoUrl,
          provider: 'google'
        })
      } else if (!user.image && googlePhotoUrl) {
        user.image = googlePhotoUrl;
        await user.save();
      }
      return done(null, user)
    } catch (err) {
      done(err)
    }
  }
))

module.exports = passport