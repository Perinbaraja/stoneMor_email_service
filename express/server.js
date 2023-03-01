"use strict";
const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const serverless = require("serverless-http");
const { sendMail } = require("../services/mail.services");
let from = `StoneMor Survey <akris@stonemor.com>`;
const handlebars = require("handlebars");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
const router = express.Router();
// //Allowing cors
app.use(cors());
// //Body parser
// app.use(express.json({ limit: "50mb" }));
// app.use(
//   express.urlencoded({
//     limit: "50mb",
//     extended: true,
//     parameterLimit: 500000,
//   })
// );

// // read the email template file

const emailSource = `
<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>


</head>
<body>

  <h1>{{message}}</h1>
  <h3>{{description}}</h3>
  <form id="myForm" action="https://main.d3d8mcg1fsym22.amplifyapp.com/shortsurvey/{{surveyEntryId}}">
  <div style="display: flex; flex-wrap: wrap; justify-content: space-between; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #444;">
  <div style="flex-basis: 10%; text-align: right;">
    <p style="text-align: right; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #444; ">Not at all likely</p>
  </div>
  <div id="sidebar-left" style="flex-basis: 50%; text-align: center; padding-right: 250px  ">
    <p></p>
  </div>
  <div id="sidebar-right" style="flex-basis: 25%; text-align: center; ;">
    <p></p>
  </div>
</div>
    <div style=" display: flex;
    flex-direction: row;
    justify-content: space-between;">
      <input type="radio" id="star1" name="rating" value="1" style="display: none;" />
      <label for="star1" style="background-color: #bb1e1e; color: #ffffff; font-size: 2rem; cursor: pointer; padding: 5px 10px; border-radius: 2px; margin-right: 3px;">1</label>
      <input type="radio" id="star2" name="rating" value="2" style="display: none;" />
      <label for="star2" style="background-color: #bb1e1e; color: #ffffff; font-size: 2rem; cursor: pointer; padding: 5px 10px; border-radius: 2px; margin-right: 3px;">2</label>
      <input type="radio" id="star3" name="rating" value="3" style="display: none;" />
      <label for="star3" style="background-color: #bb1e1e; color: #ffffff; font-size: 2rem; cursor: pointer; padding: 5px 10px; border-radius: 2px; margin-right: 3px;">3</label>
      <input type="radio" id="star4" name="rating" value="4" style="display: none;" />
      <label for="star4" style="background-color: #bb1e1e; color: #ffffff; font-size: 2rem; cursor: pointer; padding: 5px 10px; border-radius: 2px; margin-right: 3px;">4</label>
      <input type="radio" id="star5" name="rating" value="5" style="display: none;" />
      <label for="star5" style="background-color: #bb1e1e; color: #ffffff; font-size: 2rem; cursor: pointer; padding: 5px 10px; border-radius: 2px; margin-right: 3px;">5</label>
    
  <input type="radio" id="star6" name="rating" value="6" style="display: none;" />
  <label for="star6" style="background-color: #bb1e1e; color: #ffffff; font-size: 2rem; cursor: pointer; padding: 5px 10px; border-radius: 2px; margin-right: 3px;">6</label>
  <input type="radio" id="star7" name="rating" value="7" style="display: none;" />
  <label for="star7" style="background-color: #bb1e1e; color: #ffffff; font-size: 2rem; cursor: pointer; padding: 5px 10px; border-radius: 2px; margin-right: 3px;">7</label>
  <input type="radio" id="star8" name="rating" value="8" style="display: none;" />
  <label for="star8" style="background-color: #bb1e1e; color: #ffffff; font-size: 2rem; cursor: pointer; padding: 5px 10px; border-radius: 2px; margin-right: 3px;">8</label>
  <input type="radio" id="star9" name="rating" value="9" style="display: none;" />
  <label for="star9" style="background-color: #bb1e1e; color: #ffffff; font-size: 2rem; cursor: pointer; padding: 5px 10px; border-radius: 2px; margin-right: 3px;">9</label>
 
  <input type="radio" id="star10" name="rating" value="10" style="display: none;" />
  <label for="star10" style="background-color: #bb1e1e; color: #ffffff; font-size: 2rem; cursor: pointer; padding: 5px 10px; border-radius: 2px; margin-right: 3px;">10</label>

    </div>
    <p style="padding-left: 330px;" >Extremely likely</p>  <br/><br/><br/>

    <p>{{feedback}}</p>
    <button style="background-color: #4CAF50; color: white; padding:5px 10px; border: none; border-radius: 2px; cursor: pointer;" onclick="submitForm()">Submit</button> 
  </form> <br/><br/><br/>

  If the above content hasn't loaded properly, please click <a href="https://main.d3d8mcg1fsym22.amplifyapp.com/shortsurvey/{{surveyEntryId}}">here</a> to take/complete the survey. <br/><br/><br/>
  <script>

    function updateValue(newValue) {
      var value = Math.floor((newValue - 1) / 9 * 10) + 1;
      document.getElementById("ratingValue").innerHTML = value; 
      var form = document.getElementById("myForm");
    }


  </script>
</body>
</html> 
`;
// compile the email template
const template = handlebars.compile(emailSource);

router.post("/incompletedUserlinksend", async (req, res) => {
  try {
    const { mail } = req.body;
    const mailPromises = mail.map(async (data) => {
      console.log(data);
      const mailOptions = {
        from: `StoneMor Short Survey <akris@stonemor.com>`,
        to: data.email,
        subject: `stonemor survey Link`,
        html: template({
          title: "Survey Email",
          message: "Please take a moment to complete this survey",
          description: "Rate our service?",
          feedback:
            "Your feedback is important to us. Please share your thoughts or suggestions.",
          surveyEntryId: data.SurveyEntryId,

          email: data.email,
        }),
      };
      const mailSent = await sendMail(mailOptions);
      return { email: data.email, mailSent };
    });
    const results = await Promise.all(mailPromises);
    res.json({ success: true, results });
  } catch (err) {
    console.log("mailChat err: ", err);
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
});

router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>Hello from Express.js!</h1>");
  res.end();
});
router.post("/send", async (req, res) => {
  try {
    const { mail, qrCode, survey, loc } = req.body;

    console.log(qrCode, mail);
    const mailOptions = {
      from: from,
      to: mail,
      subject: `Scan the QR code for the ${loc} and attend the survey`,
      html: `<p><strong>
        Hello user,<br/><br/>
  Please Scan the attached QR code to attend the survey - ${survey} - ${loc} <br/><br/><br/>
  Regards,<br/> Stonemor Survey Team </strong></p>`,
      attachments: [
        {
          filename: `${survey}.png`,
          content: qrCode.split("base64,")[1],
          encoding: "base64",
        },
      ],
    };
    const mailSent = await sendMail(mailOptions);
    res.json({ success: true, mailSent });
  } catch (err) {
    console.log("mailChat err: ", err);
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
});

router.post("/linksend", async (req, res) => {
  try {
    const { mail, userName, surveyLink, survey } = req.body;

    // console.log(surveyLink, mail);
    const mailOptions = {
      from: from,
      to: mail,
      subject: `stonemor survey Link`,
      html: `<p><strong>
        Hello ${userName},<br/><br/>
        Please <a href="${surveyLink}">click here</a> to attend the survey - ${survey}  <br/><br/><br/>
        Regards,<br/> Stonemor Survey Team </strong></p>`,
    };
    const mailSent = await sendMail(mailOptions);
    res.json({ success: true, mailSent });
  } catch (err) {
    console.log("mailChat err: ", err);
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
});

router.post("/submit-rating", async (req, res) => {
  try {
    const { rating } = req.body;

    res.json({ success: true, rating });
  } catch (err) {
    console.log("submitRating err: ", err);
    return res.json({ msg: err || config.DEFAULT_RES_ERROR });
  }
});

//Middleware configuration
app.use("/.netlify/functions/server", router); // path must route to lambda
app.use("/", (req, res) => res.sendFile(path.join(__dirname, "./index.html")));

module.exports = app;
module.exports.handler = serverless(app);
