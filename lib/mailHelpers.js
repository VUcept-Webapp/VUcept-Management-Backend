require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.GENERATE_ACCESS_TOKEN_URI
    );
  
    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN
    });
  
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.log(err);
          reject("Failed to create access token");
        }
        resolve(token);
      });
    });
  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.MAIL_EMAIL,
        accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
      }
    });
  
    return transporter;
};
  
exports.sendEmail = async (emailOptions) => {
  var emailTransporter = await createTransporter();
  await emailTransporter.sendMail(emailOptions);
};