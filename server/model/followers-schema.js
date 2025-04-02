import mongoose from "mongoose";

const FollowerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures a user has only one follower document
      index: true   // Indexing for fast lookup
    },
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true } // Index to optimize follower lookups
    ],
    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true } // Index to optimize following lookups
    ]
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);
// https://canadianlic-854202032.development.catalystserverless.com
// Create compound indexes for better query performance
FollowerSchema.index({ user: 1 }); // Fast lookup by user
FollowerSchema.index({ followers: 1 }); // Optimize searches by followers
FollowerSchema.index({ following: 1 }); // Optimize searches by following

const Follower = mongoose.model("Follower", FollowerSchema);
export default Follower;
