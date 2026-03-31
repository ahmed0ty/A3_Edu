// import mongoose from "mongoose";

// const reactionSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
//   comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },

//   type: {
//     type: String,
//     enum: ["like", "love", "haha", "wow", "sad", "angry"],
//     required: true,
//   },
// }, { timestamps: true });

// reactionSchema.index({ user: 1, comment: 1 }, { unique: true });

// export default mongoose.model("Reaction", reactionSchema);