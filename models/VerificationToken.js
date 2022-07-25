const mongoose= require("mongoose");
const PaidUser = require("../models/PaidUser.js")

const verificationTokenSchema = new mongoose.Schema({
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:PaidUser
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