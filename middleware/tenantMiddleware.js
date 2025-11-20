const prisma = require('../config/prisma');

const tenantMiddleware = async (req, res, next) => {
    // In a real multi-tenant app, we might determine tenant from subdomain or header.
    // For this API, we assume the user's login context determines the tenant.
    // This middleware ensures that subsequent operations respect the user's institution.
    
    if (req.user) {
        // If user is authenticated, attach their institution context
        req.tenant = {
            institutionId: req.user.institutionId,
            departmentId: req.user.departmentId
        };
    } else {
        // For public routes or pre-auth, we might look for a header 'x-institution-code'
        const institutionCode = req.headers['x-institution-code'];
        if (institutionCode) {
            const institution = await prisma.institution.findUnique({
                where: { code: institutionCode }
            });
            if (institution) {
                req.tenant = { institutionId: institution.id };
            }
        }
    }
    next();
};

module.exports = { tenantMiddleware };
