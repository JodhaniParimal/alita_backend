const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const changeTaskStatusMailer = async (project_title, email, attachments) => {
  try {
    const filename = path.basename(attachments).split(".")[0];
    const urlForDone = `${process.env.REACT_APP_BASE_URL}/${filename}`;
    const emailConfig = {
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASSWORD,
      },
    };
    let transporter = nodemailer.createTransport(emailConfig);
    const emailTemplateSource = fs.readFileSync(
      "./views/mails/changeTaskStatus.hbs",
      "utf8"
    );
    const template = handlebars.compile(emailTemplateSource);
    const htmlToSend = template({
      project_title: project_title,
      urlForDone: urlForDone,
    });
    let info = await transporter.sendMail({
      from: process.env.MAIL_AUTH_USER,
      to: email,
      subject: `Alita-tools Ready To QA tasks`,
      text: "Alita-tools task status",
      html: htmlToSend,
      attachments: [{ path: attachments }],
    });

    console.log("Message sent: %s************************", info.messageId);
    // console.log(
    //   "Preview URL: %s-------------------",
    //   nodemailer.getTestMessageUrl(info)
    // );
  } catch (err) {
    console.error("err", err);
  }
};

module.exports = { changeTaskStatusMailer };
