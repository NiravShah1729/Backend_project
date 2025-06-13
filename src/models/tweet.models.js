// id string pk
//   owner ObjectId users
//   content string
//   createdAt Date
//   updatedAt Date

import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
// This schema defines a Tweet model with fields for the owner (a reference to a User),
// the content of the tweet, and timestamps for creation and updates. The owner field is required,