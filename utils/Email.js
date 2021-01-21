const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Gotours <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // send grid
            return nodemailer.createTransport({
                host: process.env.EMAIL_SERVER,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.TEST_EMAIL_HOST,
            port: process.env.TEST_EMAIL_PORT,
            auth: {
                user: process.env.TEST_EMAIL_USERNAME,
                pass: process.env.TEST_EMAIL_PASSWORD
            }
        });
    }

    // send the actual email
    async send(template, subject) {
        const html = pug.renderFile(
            `${__dirname}/../views/email/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject
            }
        );
        // define email message and options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html, {
                wordwrap: 130
            })
        };

        // create transport and send the email
        await this.newTransport().sendMail(mailOptions);
    }

    // send welcome email
    async sendWelcome() {
        await this.send('welcome', 'Welcome to Gotours');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Password reset for your Gotours account valid for 20 minutes'
        );
    }
};
