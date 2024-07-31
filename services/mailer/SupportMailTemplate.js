const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

//Nodemailer function for add support ticket
async function sendEmailAddSupportTicket(to, subject, payload) {
    try {
        const emailConfig = {
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL_AUTH_USER,
                pass: process.env.MAIL_AUTH_PASSWORD,
            },
        };

        const transporter = nodemailer.createTransport(emailConfig);

        const emailTemplateSource = fs.readFileSync(
            "./views/mails/itsupportmail/addTicket.hbs",
            "utf8"
        );
        const template = handlebars.compile(emailTemplateSource);
        const htmlToSend = template({
            firstname: payload.firstname,
            lastname: payload.lastname,
            colour: payload.colour
        });

        const sentPromises = to.map(async (recipient) => {
            const info = await transporter.sendMail({
                from: process.env.MAIL_AUTH_USER,
                to: recipient,
                subject,
                // text: "Alita Tool Leave Management System",
                html: htmlToSend,
            });
            console.log("Mail sent successfully to", recipient);
            return info;
        });

        const results = await Promise.all(sentPromises);
        // console.log("results", results);

        // console.log("info--------------------------", info);
        // console.log("Message sent: %s************************", info.messageId);
        // console.log(
        //   "Preview URL: %s-------------------",
        //   nodemailer.getTestMessageUrl(info)
        // );

        return 1;
    } catch (err) {
        console.error("err", err);
        return 0;
    }
}

//Nodemailer function for update support ticket
async function sendEmailUpdateSupportTicket(to, subject, payload) {
    try {
        const emailConfig = {
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL_AUTH_USER,
                pass: process.env.MAIL_AUTH_PASSWORD,
            },
        };

        const transporter = nodemailer.createTransport(emailConfig);

        const emailTemplateSource = fs.readFileSync(
            "./views/mails/itsupportmail/updateTicket.hbs",
            "utf8"
        );
        const template = handlebars.compile(emailTemplateSource);
        const htmlToSend = template({
            firstname: payload.firstname,
            lastname: payload.lastname,
            supportFirst: payload.supportFirst,
            supportLast: payload.supportLast,
        });

        const sentPromises = to.map(async (recipient) => {
            const info = await transporter.sendMail({
                from: process.env.MAIL_AUTH_USER,
                to: recipient,
                subject,
                // text: "Alita Tool Leave Management System",
                html: htmlToSend,
            });
            console.log("Mail sent successfully to", recipient);
            return info;
        });

        const results = await Promise.all(sentPromises);
        // console.log("results", results);

        // console.log("info--------------------------", info);
        // console.log("Message sent: %s************************", info.messageId);
        // console.log(
        //   "Preview URL: %s-------------------",
        //   nodemailer.getTestMessageUrl(info)
        // );

        return 1;
    } catch (err) {
        console.error("err", err);
        return 0;
    }
}

module.exports = {
    sendEmailAddSupportTicket,
    sendEmailUpdateSupportTicket
};
