const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

class EmailService {
    async sendEmail(to, subject, htmlContent) {
        try {
            const info = await transporter.sendMail({
                from: `"Event Management System" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html: htmlContent
            });
            console.log(`📧 Email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error('❌ Email Send Error:', error);
            // Don't throw, just log. Email failure shouldn't crash the app.
        }
    }

    async sendApprovalRequest(to, userName, eventTitle, role) {
        const subject = `Action Required: Approval Needed for "${eventTitle}"`;
        const html = `
            <h3>Hello ${userName},</h3>
            <p>A new event <strong>"${eventTitle}"</strong> requires your approval as <strong>${role}</strong>.</p>
            <p>Please login to the dashboard to review and take action.</p>
            <br>
            <p>Regards,<br>Event Management Team</p>
        `;
        await this.sendEmail(to, subject, html);
    }

    async sendStatusUpdate(to, userName, eventTitle, status) {
        const subject = `Event Status Update: "${eventTitle}"`;
        const html = `
            <h3>Hello ${userName},</h3>
            <p>Your event <strong>"${eventTitle}"</strong> has been updated to: <strong>${status}</strong>.</p>
            <br>
            <p>Regards,<br>Event Management Team</p>
        `;
        await this.sendEmail(to, subject, html);
    }

    async sendWelcomeEmail(to, name, email, password, institutionName, departmentName) {
        const subject = 'Welcome to EMS - Your Credentials';
        const html = `
            <h3>Welcome ${name},</h3>
            <p>Your account has been created successfully.</p>
            <p><strong>Institution:</strong> ${institutionName}</p>
            <p><strong>Department:</strong> ${departmentName}</p>
            <hr>
            <p><strong>Login Credentials:</strong></p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <hr>
            <p>Please login and change your password immediately.</p>
            <br>
            <p>Regards,<br>Event Management Team</p>
        `;
        await this.sendEmail(to, subject, html);
    }
}

module.exports = new EmailService();
