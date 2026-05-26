const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    githubId: {
      type: String,
      required: false,
    },
    displayName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);