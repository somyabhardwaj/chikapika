import mongoose from "mongoose";

export const connectToDb = async ()=>{
    try {
      await  mongoose.connect("mongodb://localhost:27017/");
      // console.log( "connected to mongoose")
      return "connected to mongoose";
    } catch (error) {
        console.log(error)
    }
}