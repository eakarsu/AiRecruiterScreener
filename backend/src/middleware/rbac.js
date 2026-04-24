// Role-Based Access Control middleware
const ROLES = {
  admin: ['admin'],
  recruiter: ['admin', 'recruiter'],
  hiring_manager: ['admin', 'recruiter', 'hiring_manager'],
  interviewer: ['admin', 'recruiter', 'hiring_manager', 'interviewer'],
};

// Check if user has one of the required roles
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role '${userRole}' does not have permission. Required: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

// Check if user is admin
const requireAdmin = requireRole('admin');

// Check if user is recruiter or admin
const requireRecruiter = requireRole('admin', 'recruiter');

// Check if user is hiring manager, recruiter, or admin
const requireHiringManager = requireRole('admin', 'recruiter', 'hiring_manager');

// Allow all authenticated roles
const requireAnyRole = requireRole('admin', 'recruiter', 'hiring_manager', 'interviewer');

module.exports = {
  requireRole,
  requireAdmin,
  requireRecruiter,
  requireHiringManager,
  requireAnyRole,
  ROLES,
};
