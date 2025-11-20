const prisma = require('../config/prisma');
const notificationService = require('./notificationService');


class ApprovalService {
    async createApprovalRequest(eventId, approverId, role) {
        // Check if already exists to avoid duplicates
        const existing = await prisma.approval.findFirst({
            where: { eventId, approverId, status: 'PENDING' }
        });
        if (existing) return existing;

        return await prisma.approval.create({
            data: {
                eventId,
                approverId,
                role,
                status: 'PENDING'
            }
        });
    }

    async processApproval(approvalId, status, comments, userId) {
        // 1. Update Approval Record
        const approval = await prisma.approval.update({
            where: { id: approvalId },
            data: {
                status,
                comments,
                signedAt: new Date()
            },
            include: { event: true }
        });

        // 2. Log Audit
        await prisma.auditLog.create({
            data: {
                action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
                entityType: 'Approval',
                entityId: String(approvalId),
                actorId: userId,
                changes: { status, comments }
            }
        });

        // 3. Check if we should transition the Event
        // If REJECTED, immediate rejection of event
        if (status === 'REJECTED') {
            await this.rejectEvent(approval.event, userId);
            return approval;
        }

        // If APPROVED, check if we have enough approvals to move to next stage
        const shouldTransition = await this.checkApprovalRules(approval.event, approval.role);
        
        if (shouldTransition) {
            await this.handleEventTransition(approval.event, approval.role, userId);
        }

        return approval;
    }

    async rejectEvent(event, actorId) {
        await prisma.event.update({
            where: { id: event.id },
            data: { status: 'REJECTED' }
        });
        await notificationService.createNotification(event.organizerId, 'Event Rejected', `Your event "${event.title}" was rejected.`, 'ERROR');
    }

    async checkApprovalRules(event, role) {
        // 1. Admin Override
        if (role === 'ADMIN') return true;

        // 2. HOD - Always Single Approver
        if (role === 'HOD') return true;

        // 3. HLC - Check Institution Config
        if (role === 'HLC_MEMBER') {
            const institution = await prisma.institution.findUnique({ where: { id: event.institutionId } });
            const config = institution.approvalConfig || {};
            const mode = config.hlcMode || 'SINGLE'; // SINGLE, UNANIMOUS, MAJORITY

            if (mode === 'SINGLE') return true;

            // Count total HLC approvals for this event
            const totalApprovals = await prisma.approval.count({
                where: { eventId: event.id, role: 'HLC_MEMBER', status: 'APPROVED' }
            });
            
            // Count total active HLC members
            const totalMembers = await prisma.user.count({
                where: { institutionId: event.institutionId, role: 'HLC_MEMBER', isActive: true }
            });

            if (mode === 'UNANIMOUS') {
                return totalApprovals === totalMembers;
            }

            if (mode === 'MAJORITY') {
                return totalApprovals > (totalMembers / 2);
            }
        }

        // 4. Management - Default to Single (Secretary or Joint Secretary)
        if (role === 'MANAGEMENT') return true;

        return true;
    }

    async handleEventTransition(event, currentRole, actorId) {
        let newStatus = event.status;
        let nextRole = null;

        // Determine Next State
        switch (currentRole) {
            case 'HOD':
                newStatus = 'HOD_APPROVED';
                nextRole = 'HLC_MEMBER';
                break;
            case 'HLC_MEMBER':
                newStatus = 'HLC_APPROVED';
                nextRole = 'MANAGEMENT';
                break;
            case 'MANAGEMENT':
                newStatus = 'APPROVED';
                break;
            case 'ADMIN':
                newStatus = 'APPROVED';
                break;
        }

        if (newStatus !== event.status) {
            await prisma.event.update({
                where: { id: event.id },
                data: { status: newStatus }
            });
            
            await prisma.auditLog.create({
                data: {
                    action: 'STATE_CHANGE',
                    entityType: 'Event',
                    entityId: String(event.id),
                    changes: { from: event.status, to: newStatus }
                }
            });

            await notificationService.createNotification(event.organizerId, 'Event Status Updated', `Your event "${event.title}" is now ${newStatus}.`, 'SUCCESS');

            if (nextRole && newStatus !== 'APPROVED') {
                await this.assignNextApprover(event, nextRole);
            }
        }
    }

    async assignNextApprover(event, role) {
        // Find users with the required role
        let whereClause = {
            role: role,
            institutionId: event.institutionId,
            isActive: true
        };

        if (role === 'HOD') {
            // HOD is specific to the department
            whereClause.departmentId = event.departmentId;
        }

        // Find ALL matching approvers (e.g. all HLC members)
        const nextApprovers = await prisma.user.findMany({
            where: whereClause
        });

        if (nextApprovers.length > 0) {
            for (const approver of nextApprovers) {
                await this.createApprovalRequest(event.id, approver.id, role);
                await notificationService.createNotification(approver.id, 'New Approval Request', `You have a new event approval request: "${event.title}"`, 'INFO');
            }
            console.log(`✅ Assigned ${role} approval to ${nextApprovers.length} users.`);
        } else {
            console.warn(`⚠️ No active user found for role ${role} in context. Approval chain stalled.`);
        }
    }
}

module.exports = new ApprovalService();
