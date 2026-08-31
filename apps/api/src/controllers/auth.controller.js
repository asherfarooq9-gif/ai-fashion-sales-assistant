import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { AdminUser } from '../models/index.js';
import { signAdminToken } from '../middleware/auth.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await AdminUser.findOne({ email: email.toLowerCase() });
  if (!admin || !(await admin.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  const token = signAdminToken(admin);
  res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name } });
});

export const me = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.admin.id).select('email name role');
  if (!admin) throw ApiError.unauthorized();
  res.json({ admin });
});
