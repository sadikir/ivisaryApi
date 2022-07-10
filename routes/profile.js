const router = require("express").Router();
const User = require("../models/Profile.js")
const bcrypt=require("bcrypt");

router.put("/:id", async (req, res)=>{
  if(req.params.id===req.body.userId){
    const validPass= await User.findById(req.params.id);
    console.log(validPass)
    // const salt = await bcrypt.genSalt(10);
    // req.body.passWord = await bcrypt.hash(req.body.passWord, salt);
    const validated= await bcrypt.compare(req.body.passWord,validPass.passWord)
    console.log(validated);
    if(validated){
      try{
       const salt = await bcrypt.genSalt(10);
       req.body.newPass= await bcrypt.hash(req.body.newPass, salt)
       const user =await User.findByIdAndUpdate(req.params.id,{
         $set: {firstName:req.body.firstName, lastName:req.body.lastName,phone:req.body.phone, accountType:req.body.accountType,email:req.body.email,passWord:req.body.newPass}
    },{new:true})
    const {passWord, ...others} = user._doc;
    res.status(200).json(others)
    }catch(err){
      res.status(500).json(err)
      console.log(err)
    }
    }else{
      res.status(500).json("Wrong credentials")
    }
  }else{
    res.status(401).json("You can only update your account")
  }
})
module.exports = router;