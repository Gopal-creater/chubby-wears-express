import nodemailer, { TransportOptions } from "nodemailer";

const sendMail = async (options: {
  email: string;
  subject: string;
  message: string;
}) => {
  //Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  } as TransportOptions);

  //Define the email options
  const mailOptions = {
    from: "Gopal Gautam <gopalgautam05@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendMail;
