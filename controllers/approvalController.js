const approvalService = require('../services/approvalService');
const prisma = require('../config/prisma');

const approveEvent = async (req, res, next) => {
    try {
        const { approvalId } = req.params;
        const { comments } = req.body;
        const userId = req.user.id;

        // Verify ownership of approval request
        const approval = await prisma.approval.findUnique({ where: { id: parseInt(approvalId) } });
        if (!approval) {
            return res.status(404).json({ error: 'Approval request not found' });
        }

        if (approval.approverId !== userId) {
            return res.status(403).json({ error: 'Not authorized to approve this request' });
        }

        const result = await approvalService.processApproval(parseInt(approvalId), 'APPROVED', comments, userId);
        res.json({ message: 'Event approved successfully', result });
    } catch (error) {
        next(error);
    }
};

const rejectEvent = async (req, res, next) => {
    try {
        const { approvalId } = req.params;
        const { comments } = req.body;
        const userId = req.user.id;

        const approval = await prisma.approval.findUnique({ where: { id: parseInt(approvalId) } });
        if (!approval) {
            return res.status(404).json({ error: 'Approval request not found' });
        }

        if (approval.approverId !== userId) {
            return res.status(403).json({ error: 'Not authorized to reject this request' });
        }

        const result = await approvalService.processApproval(parseInt(approvalId), 'REJECTED', comments, userId);
        res.json({ message: 'Event rejected', result });
    } catch (error) {
        next(error);
    }
};

const getMyApprovals = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const approvals = await prisma.approval.findMany({
            where: { approverId: userId, status: 'PENDING' },
            include: { event: true }
        });
        res.json(approvals);
    } catch (error) {
        next(error);
    }
};

module.exports = { approveEvent, rejectEvent, getMyApprovals };
