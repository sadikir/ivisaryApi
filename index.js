const express=require('express')
const multer = require("multer");
const app = express();
const mongoose = require("mongoose")
const authRoute = require("./routes/auth.js")
const profileRoute = require("./routes/profile")

app.use(express.json())
let PORT=process.env.PORT | 3000;
let MongoUrl= process.env.MONGO_URL

mongoose.connect(MongoUrl,{
   useNewUrlParser:true,
   useUnifiedTopology:true,
  
 }).then(console.log("db connection successfully.")).catch(err=>console.log(err))


app.listen(PORT, ()=>{
console.log("backend is running")
})
const storage= multer.diskStorage({
  destination:(req, file, cb)=>{
    cb(null,"images");
  },
  filename:(req,file,cb)=>{
    cb(null,"test.jpg")
  }
});
const upload = multer({storage:storage});
app.post("/api/upload", upload.single("file"), (req, res)=>{
  res.status(200).json("file uploaded")
})
app.use("/api/auth", authRoute)
app.use("/api/profile", profileRoute);
