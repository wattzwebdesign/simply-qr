const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function requireAdmin(req, res, next) {
  try {
    // Assumes authenticateToken middleware has already run
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
}

module.exports = requireAdmin;
