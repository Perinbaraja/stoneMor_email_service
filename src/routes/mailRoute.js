const express = require("express");
const QRCode = require("qrcode");

const { sendMail } = require("../../services/mail.services");
const router = express.Router();
router.get("/", (req, res) => res.send("mail Route"));
let from = `StoneMor <perinbaraja1996@gmail.com>`;
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
module.exports = router;
