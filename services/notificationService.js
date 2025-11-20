const prisma = require('../config/prisma');
const emailService = require('./emailService');

class NotificationService {
    async createNotification(userId, title, message, type = 'INFO', metadata = {}) {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                metadata
            }
        });

        // Send Email Notification asynchronously
        (async () => {
            try {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user && user.email) {
                    await emailService.sendEmail(user.email, title, message);
                }
            } catch (err) {
                console.error('Failed to send email notification:', err);
            }
        })();

        return notification;
    }

    async markAsRead(notificationId, userId) {
        return await prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId: userId
            },
            data: { isRead: true }
        });
    }

    async getUserNotifications(userId) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
}

module.exports = new NotificationService();
