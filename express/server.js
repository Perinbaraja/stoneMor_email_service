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
const templatePath = path.join(__dirname, "survey-email-template.hbs");

fs.readFile(templatePath, "utf8", (err, emailSource) => {
  if (err) {
    console.error(err);
    return;
  }
  // compile the email template
  const template = handlebars.compile(emailSource);

  router.post("/incompletedUserlinksend", async (req, res) => {
    try {
      const { mail } = req.body;
      const mailPromises = mail.map(async (email) => {
        const mailOptions = {
          from: from,
          to: email,
          subject: `stonemor survey Link`,
          html: template({
            title: "Survey Email",
            message: "Please take a moment to complete this survey",
            description: "Rate our service?",
            feedback:
              "Your feedback is important to us. Please share your thoughts or suggestions.",
          }),
        };
        const mailSent = await sendMail(mailOptions);
        return { email, mailSent };
      });
      const results = await Promise.all(mailPromises);
      res.json({ success: true, results });
    } catch (err) {
      console.log("mailChat err: ", err);
      return res.json({ msg: err || config.DEFAULT_RES_ERROR });
    }
  });
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
