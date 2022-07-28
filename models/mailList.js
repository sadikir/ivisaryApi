const mongoose= require("mongoose");


const maillistSchema = new mongoose.Schema({
  email:{
      type:String,
      required:true,
      
    }
},
{timestamps:true}
)
module.exports = mongoose.model("Maillist", maillistSchema)