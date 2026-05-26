const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const githubEmail =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;

        // Returning GitHub user?
        let user = await User.findOne({ githubId: profile.id });
        if (user) {
          return done(null, user);
        }

        // Email matches an existing local account? Link them
        if (githubEmail) {
          user = await User.findOne({ email: githubEmail });
          if (user) {
            user.githubId = profile.id;
            if (!user.displayName) user.displayName = profile.displayName;
            await user.save();
            return done(null, user);
          }
        }

        // Brand new user
        if (!githubEmail) {
          return done(null, false, {
            message: 'GitHub account has no accessible email address.',
          });
        }

        const newUser = await User.create({
          githubId: profile.id,
          email: githubEmail,
          displayName: profile.displayName || profile.username,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;