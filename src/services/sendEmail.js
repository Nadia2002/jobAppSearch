import nodemailer from "nodemailer";



export const sendEmail = async (to, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Make sure this is an App Password
    }
  });

  const info = await transporter.sendMail({
    from: '<nadiaelassal90@gmail.com>',
    to: to,
    subject: subject,
    html: htmlContent // Add HTML content here
  });

  
};
