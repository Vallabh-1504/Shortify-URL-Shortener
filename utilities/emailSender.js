const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

module.exports.sendOtpEmail = async (email, otp) =>{
    // HTML Email Template
    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .header {
                    background-color: #212529; /* Dark background matching your Navbar */
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                }
                .content {
                    padding: 30px 20px;
                    background-color: #f8f9fa; /* Light background */
                    text-align: center;
                }
                .otp-box {
                    background-color: #ffffff;
                    border: 2px dashed #0d6efd; /* Primary blue color */
                    border-radius: 8px;
                    display: inline-block;
                    padding: 15px 30px;
                    margin: 20px 0;
                }
                .otp-code {
                    font-size: 32px;
                    font-weight: bold;
                    color: #212529;
                    letter-spacing: 5px;
                }
                .footer {
                    background-color: #ffffff;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #6c757d;
                    border-top: 1px solid #e0e0e0;
                }
                .btn-link {
                    color: #0d6efd;
                    text-decoration: none;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Shortify</h1>
                </div>
                <div class="content">
                    <h2>Login Verification</h2>
                    <p>Hello,</p>
                    <p>Use the One-Time Password (OTP) below to log in to your account. This code is valid for <strong>5 minutes</strong>.</p>
                    
                    <div class="otp-box">
                        <span class="otp-code">${otp}</span>
                    </div>
                    
                    <p>If you didn't request this code, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>Shortify App & bull; Secure URL Shortener</p>
                    <p>Made by <strong>Vallabh, ce23b122</strong></p>
                    <p>
                        <a href="https://github.com/vallabh-1504" class="btn-link">View on GitHub</a>
                    </p>
                </div>
            </div>
        </body>
        </html>`;


    const mailOptions = {
        from: '"Shortify Auth" <no-reply@shortify.com>',
        to: email,
        subject: 'Your Login OTP',
        text: `Your One-Time Password (OTP) is: ${otp}. It expires in 5 minutes.`,
        html: htmlTemplate
    };
    await transporter.sendMail(mailOptions);
};