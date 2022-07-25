const router = require("express").Router();
const PaidUser = require("../models/PaidUser.js")
const bcrypt=require("bcrypt");


router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://ivisary.sadikirungo.repl.co"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.put("/:id", async (req, res)=>{
  let emailExist=""
  if(req.params.id===req.body.userId){
    try{
      const user =await PaidUser.findById(req.params.id);

      if(!user){
        res.status(400).json("Wrong id!");
        throw new Error("Wrong user Id")
      }
      
      const validPass= await bcrypt.compare(req.body.oldPass,user.passWord)
        console.log(validPass)
      
      if(!validPass){
        res.status(400).json("Wrong password!");
        throw new Error("wrong password")
      }
      if(user.email===req.body.email){
        emailExist=true;
        console.log("old email")
      }else{
        emailExist=false
        console.log("new email")
      }
      const salt = await bcrypt.genSalt(10);
      req.body.newPass = await bcrypt.hash(req.body.newPass, salt)
      const updatedUser = await PaidUser.findByIdAndUpdate(req.params.id,{
          $set: {firstName:req.body.firstName,
                 lastName:req.body.lastName,
                 phone:req.body.phone,
                 address:req.body.address,
                 isVerified:emailExist,
                 email:req.body.email,
                 passWord:req.body.newPass}
    },{new:true})
      const {passWord, frontID, backID, sefliePhoto, incomeDoc, ...others} = updatedUser._doc                 
      res.status(200).json(others)
      
    }catch(err){
      console.log(err)
    }
  }else{
    res.status(401).json("You can only update your account")
    console.log("invalid id")
  }
})
module.exports = router;