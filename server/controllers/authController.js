import * as authService from '../services/authService.js';

/**
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { fullName, email, password, role } = req.body;
    const result = await authService.registerUser({ fullName, email, password, role });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password, rememberMe } = req.body;
    const result = await authService.loginUser({
      email,
      password,
      rememberMe: rememberMe === true || rememberMe === 'true',
    });

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      token: result.token,
      user: result.user,
      rememberMe: result.rememberMe,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res, next) {
  try {
    await authService.logoutUser(req.token);
    res.status(200).json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/profile
 */
export async function getProfile(req, res, next) {
  try {
    const user = await authService.getUserProfile(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

export default { register, login, logout, getProfile };
