import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000
    },
    image: {
      type: String,
      default: null,
      // Stocke l'image en base64 ou URL
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    isReported: {
      type: Boolean,
      default: false
    },
    reports: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      reason: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

export const Idea = mongoose.model("Idea", ideaSchema);

