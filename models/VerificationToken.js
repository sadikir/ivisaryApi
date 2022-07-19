const mongoose= require("mongoose");
const User = require("../models/Profile.js")

const verificationTokenSchema = new mongoose.Schema({
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:User
  },
  tokenCode:{
    type:String,
    required:true
  },
  createAt:{
    type:Date,
    expires:3600,
    default:Date.now()
  }
}
)
module.exports = mongoose.model("Token", verificationTokenSchema)