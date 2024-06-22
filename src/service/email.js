const nodemailer = require('nodemailer');
const logger = require("../service/logs/logger.js");

class EmailManager {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: "wiperalta@gmail.com",
                pass: "mjvp poad gjbd slig"
            }
        });
    }

    async sendConfirmationEmail(email, first_name, ticket) {
        try {
            const mailOptions = {
                from: "Coder Test <wiperalta@gmail.com>",
                to: email,
                subject: 'Confirmación de compra',
                html: `
                    <h1>Confirmación de compra</h1>
                    <p>Gracias por tu compra, ${first_name}!</p>
                    <p>El número de tu orden es: ${ticket.code}</p>
                    <p>El equipo de ventas se pondrá en contacto contigo para realizar la entrega</p>
                    <br/>
                    <p>Que tengas un gran día! </p>
                `
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            logger.error('Error al enviar el correo electrónico:', error);
        }
    }

    async sendRestoreEmail(email, first_name, token) {
        try {
            const mailOptions = {
                from: 'wiperalta@gmail.com',
                to: email,
                subject: 'Restablecimiento de Contraseña',
                html: `
                    <h1>Restablecimiento de Contraseña</h1>
                    <p>Hola ${first_name},</p>
                    <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código para cambiar tu contraseña:</p>
                    <p><strong>${token}</strong></p>
                    <p>Este código expirará en 1 hora.</p>
                    <a href="http://localhost:8080/password">Restablecer Contraseña</a>
                    <p>Si no solicitaste este restablecimiento, ignora este correo.</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            logger.error("Error al enviar correo electrónico:", error);
            throw new Error("Error al enviar correo electrónico");
        }
    }

    async sendNotificationEmail(email, first_name, subject, message) {
        try {
            const mailOptions = {
                from: 'wiperalta@gmail.com',
                to: email,
                subject: subject,
                html: `
                    <h1>${subject}</h1>
                    <p>Hola ${first_name},</p>
                    <p>${message}</p>
                    <p>Que tengas un gran día!</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            logger.error("Error al enviar correo electrónico:", error);
            throw new Error("Error al enviar correo electrónico");
        }
    }
}

module.exports = EmailManager;
