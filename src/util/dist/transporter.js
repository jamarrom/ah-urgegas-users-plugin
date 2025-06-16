const sendgridTransport = require("nodemailer-sendgrid-transport");
const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SG_KEY || null
    }
  })
);

