import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
      message:{
        type:String,        
      }
})

const message = new mongoose.model("Message",MessageSchema)
export default message