const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const { getDayOfWeek } = require("../../helpers/fn");

handlebars.registerHelper('eq', function(value, list) {
    return list.indexOf(value) !== -1;
  });

//Nodemailer function for add leave
async function sendEmailAddLeave(to, subject, payload) {
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
            "./views/mails/leavemail/addLeave.hbs",
            "utf8"
        );
        const template = handlebars.compile(emailTemplateSource);

        payload.newLeave.map((leave) => {
            leave.dayOfWeek = getDayOfWeek(leave.leave_date);
            return leave;
        });

        const htmlToSend = template({
            firstname: payload.firstname,
            lastname: payload.lastname,
            newLeave: payload.newLeave
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

async function sendEmailUpdateLeave(to, subject, payload) {
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
            "./views/mails/leavemail/updateLeave.hbs",
            "utf8"
        );
        const template = handlebars.compile(emailTemplateSource);

        payload.dayOfWeek = getDayOfWeek(payload.updateLeave.leave_date);
     
        const htmlToSend = template({
            firstname: payload.firstname,
            lastname: payload.lastname,
            leaveDate: payload.updateLeave.leave_date,
            leaveType: payload.updateLeave.leave_type,
            leaveCategory: payload.updateLeave.leave_category,
            from: payload.updateLeave.from,
            to: payload.updateLeave.to,
            dayOfWeek: payload.dayOfWeek,
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

//Nodemailer function for update leave
async function sendEmailUpdateLeaveStatus(to, subject, payload) {
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
            "./views/mails/leavemail/updateLeaveStatus.hbs",
            "utf8"
        );
        const template = handlebars.compile(emailTemplateSource);
        const htmlToSend = template({
            firstname: payload.firstname,
            lastname: payload.lastname,
            leaveFirst: payload.leaveFirst,
            leaveLast: payload.leaveLast,
            colour: payload.colour,
            leave_status: payload.leave_status,
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
    sendEmailAddLeave,
    sendEmailUpdateLeaveStatus,
    sendEmailUpdateLeave
};
