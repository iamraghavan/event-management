/**
 * @swagger
 * tags:
 *   name: Approvals
 *   description: Event approval workflow
 */

/**
 * @swagger
 * /approvals/pending:
 *   get:
 *     summary: Get pending approvals for current user
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending approvals
 */

/**
 * @swagger
 * /approvals/{approvalId}/approve:
 *   post:
 *     summary: Approve an event
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: approvalId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event approved
 */

/**
 * @swagger
 * /approvals/{approvalId}/reject:
 *   post:
 *     summary: Reject an event
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: approvalId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comments]
 *             properties:
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event rejected
 */
