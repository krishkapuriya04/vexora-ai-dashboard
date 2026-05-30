import * as adminService from '../services/adminService.js';

export async function getStats(req, res, next) {
  try {
    const stats = await adminService.getAdminStats(req.user);
    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await adminService.listUsers(req.user, {
      search: req.query.search,
      role: req.query.role,
      status: req.query.status,
    });
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await adminService.getUserById(req.user, req.params.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await adminService.updateUser(req.user, req.params.id, req.body);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    await adminService.deleteUser(req.user, req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function listOrganizations(req, res, next) {
  try {
    const organizations = await adminService.listOrganizations(req.user);
    res.json({ success: true, organizations });
  } catch (error) {
    next(error);
  }
}

export async function getOrganization(req, res, next) {
  try {
    const organization = await adminService.getOrganizationById(req.user, req.params.id);
    res.json({ success: true, organization });
  } catch (error) {
    next(error);
  }
}

export async function createOrganization(req, res, next) {
  try {
    const organization = await adminService.createOrganization(req.user, req.body);
    res.status(201).json({ success: true, organization });
  } catch (error) {
    next(error);
  }
}

export async function updateOrganization(req, res, next) {
  try {
    const organization = await adminService.updateOrganization(req.user, req.params.id, req.body);
    res.json({ success: true, organization });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await adminService.getAuditLogs(req.user);
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
}

export default {
  getStats,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  getAuditLogs,
};
