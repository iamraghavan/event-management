const prisma = require('../config/prisma');
const fileService = require('../services/fileService');
const approvalService = require('../services/approvalService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * @desc    List all events with pagination and filtering
 * @route   GET /api/v1/events
 * @access  Public
 */
const listEvents = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    // Multi-tenancy filter
    if (req.user && req.user.institutionId) {
        where.department = {
            institutionId: req.user.institutionId
        };
    }

    const [events, total] = await prisma.$transaction([
        prisma.event.findMany({
            where,
            skip,
            take: limit,
            include: {
                organizer: { select: { name: true, email: true } },
                department: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.event.count({ where })
    ]);

    successResponse(res, {
        events,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    }, 'Events retrieved successfully');
});

/**
 * @desc    Get single event by ID
 * @route   GET /api/v1/events/:id
 * @access  Public
 */
const getEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        include: {
            organizer: { select: { name: true, email: true } },
            department: { select: { name: true } },
            approvals: true,
            budgetItems: true,
            resourceRequests: true,
            attachments: true
        }
    });

    if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found' });
    }
    successResponse(res, event, 'Event retrieved successfully');
});

/**
 * @desc    Create new event
 * @route   POST /api/v1/events
 * @access  Private (Admin, Faculty, Staff, HOD, HLC, Management)
 */
const createNewEvent = asyncHandler(async (req, res) => {
    const { title, description, startDate, endDate, location } = req.body;
    const userId = req.user.id;
    const institutionId = req.user.institutionId;
    const departmentId = req.user.departmentId;
    const userEmail = req.user.email;
    const institutionCode = req.user.institutionCode || 'default';
    const departmentCode = req.user.departmentCode || 'default';

    // Defense-in-depth: Validate inputs again
    if (!departmentId) {
        return res.status(400).json({ success: false, error: 'User must belong to a department to create an event' });
    }

    // Use Transaction for Atomicity
    const result = await prisma.$transaction(async (tx) => {
        // 1. Create Event
        const event = await tx.event.create({
            data: {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                location,
                status: 'SUBMITTED',
                organizerId: userId,
                departmentId
            }
        });

        // 2. Handle File Uploads (Parallel Execution)
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => 
                fileService.uploadFile(
                    file.buffer,
                    file.originalname,
                    institutionCode,
                    departmentCode,
                    userEmail
                ).then(cdnUrl => ({
                    eventId: event.id,
                    fileName: file.originalname,
                    fileUrl: cdnUrl,
                    fileType: file.mimetype
                }))
            );

            const attachments = await Promise.all(uploadPromises);

            if (attachments.length > 0) {
                await tx.attachment.createMany({ data: attachments });
            }
        }

        return event;
    });

    // 3. Trigger Approval Workflow (Outside transaction to avoid locking if notification fails)
    // Find HOD for this department
    const hod = await prisma.user.findFirst({
        where: {
            institutionId,
            departmentId,
            role: 'HOD',
            isActive: true
        }
    });

    if (hod) {
        await approvalService.createApprovalRequest(result.id, hod.id, 'HOD');
    }

    // Fetch final event with attachments
    const finalEvent = await prisma.event.findUnique({
        where: { id: result.id },
        include: { attachments: true }
    });

    successResponse(res, finalEvent, 'Event created successfully', 201);
});

/**
 * @desc    Update existing event
 * @route   PUT /api/v1/events/:id
 * @access  Private (Owner or Admin)
 */
const updateExistingEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, startDate, endDate, location } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // RBAC Check
    if (userRole !== 'ADMIN' && event.organizerId !== userId) {
        return res.status(403).json({ success: false, error: 'Not authorized to update this event' });
    }

    const updatedEvent = await prisma.event.update({
        where: { id: parseInt(id) },
        data: {
            title,
            description,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            location
        }
    });

    successResponse(res, updatedEvent, 'Event updated successfully');
});

/**
 * @desc    Delete event (Soft delete)
 * @route   DELETE /api/v1/events/:id
 * @access  Private (Owner or Admin)
 */
const deleteExistingEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // RBAC Check
    if (userRole !== 'ADMIN' && event.organizerId !== userId) {
        return res.status(403).json({ success: false, error: 'Not authorized to delete this event' });
    }

    await prisma.event.update({
        where: { id: parseInt(id) },
        data: { deletedAt: new Date() }
    });

    successResponse(res, null, 'Event deleted successfully');
});

module.exports = { listEvents, getEvent, createNewEvent, updateExistingEvent, deleteExistingEvent };
