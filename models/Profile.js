const mongoose= require("mongoose");


const ProfileSchema = new mongoose.Schema({
  accountType:{
    type:String,
    required:false
  },
  firstName:{
    type:String,
    required:false
  },
  lastName:{
    type:String,
    required:false
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  passWord:{
    type:String,
    required:true,
  },
  phone:{
    type:String,
    required:false,
  },
  income:{
    type: String,
    required:false
  },
  employer:{
    type:String,
    required:false
  },
  frontID:{
    type:String,
    required:false
  },
    backID:{
    type:String,
    required:false
  },
  selfiePhoto:{
    type:String,
    required:false
  },
    incomeDoc:{
    type:String,
    required:false
  },
  relatives:[{
    name:String,
    country:String,
    age:String
  }],
  isVerified:{
    type:Boolean,
    default:false, 
  }
},
{timestamps:true}
)
module.exports = mongoose.model("User", ProfileSchema)