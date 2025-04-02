import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
      name:{
        type:String,        
      },
      followerData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Follower" // Reference to the Follower Schema
      }
})

const user = new mongoose.model("User",UserSchema)
export default user