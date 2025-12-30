import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    alias: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    profilePhoto: {
      type: String,
      default: null,
      // Stocke la photo en base64 ou URL
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'  // Par défaut, tout le monde est utilisateur normal
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);



export const User = mongoose.model("User", userSchema);