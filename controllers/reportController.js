const prisma = require('../config/prisma');

const getEventReport = async (req, res, next) => {
    try {
        const { startDate, endDate, status, departmentId } = req.query;
        const where = {};

        if (startDate && endDate) {
            where.startDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        if (status) {
            where.status = status;
        }

        if (departmentId) {
            where.departmentId = departmentId;
        }

        // Tenant isolation
        if (req.user.institutionId) {
            where.department = {
                institutionId: req.user.institutionId
            };
        }

        const events = await prisma.event.findMany({
            where,
            include: {
                organizer: { select: { name: true } },
                department: { select: { name: true } }
            },
            orderBy: { startDate: 'asc' }
        });

        // Summary Statistics
        const totalEvents = events.length;
        const statusCounts = events.reduce((acc, event) => {
            acc[event.status] = (acc[event.status] || 0) + 1;
            return acc;
        }, {});

        res.json({
            meta: {
                totalEvents,
                statusCounts,
                filters: { startDate, endDate, status, departmentId }
            },
            data: events
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getEventReport };
