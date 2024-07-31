const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");

const forgotPasswordMailer = async (code, email) => {
  try {
    const url = `${process.env.REACT_APP_BASE_URL}/reset-password`;
    const emailConfig = {
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASSWORD,
      },
    };
    let transporter = nodemailer.createTransport(emailConfig);
    const emailTemplateSource = fs.readFileSync(
      "./views/mails/resetPassword.hbs",
      "utf8"
    );
    const template = handlebars.compile(emailTemplateSource);
    const htmlToSend = template({ urlorcode: `${url}/${code}` });
    let info = await transporter.sendMail({
      from: process.env.MAIL_AUTH_USER,
      to: `${email}`,
      // cc: EMAIL_USER,
      subject: `Password Reset Request`,
      text: "Alita-tools password reset",
      html: htmlToSend,
    });

    console.log("info--------------------------", info);
    console.log("Message sent: %s************************", info.messageId);
    console.log(
      "Preview URL: %s-------------------",
      nodemailer.getTestMessageUrl(info)
    );
    return 1;
  } catch (err) {
    console.error("err", err);
    return 0;
  }
};

module.exports = { forgotPasswordMailer };
