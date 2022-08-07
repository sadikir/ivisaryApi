const nodemailer = require('nodemailer');
const router = require("express").Router()
const { google } = require('googleapis');


router.use((req, res, next) => {
  const allowedOrigins = ['https://ivisary.sadikirungo.repl.co', 'https://ivisary.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

router.post("/email", async (req, res)=>{
  const output = `
    <p>Ivisary Message</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.firstName} ${req.body.lastName} </li>
      
      <li>Location: ${req.body.location}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;
const CLIENT_ID = process.env.GMAIL_ID;
const CLIENT_SECRET = process.env.GMAIL_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_REFRESH;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: 'sadikirungo2020@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `${req.body.firstName} <${req.body.email}>`,
      to: 'support@ivisary.com',
      subject: 'Ivisary support email',
      
      html: output,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

sendMail()
  .then((result) => {
    res.status(200).json("email sent")
    console.log('Email sent...', result)})
  .catch((error) => console.log(error.message));

})

module.exports= router;