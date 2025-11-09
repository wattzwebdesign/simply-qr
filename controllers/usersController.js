const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await db.getAsync(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      code: 'SERVER_ERROR'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { email, firstName, lastName, currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'VALIDATION_ERROR'
      });
    }

    // Get current user
    const user = await db.getAsync(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email !== user.email) {
      const existingUser = await db.getAsync(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email is already in use',
          code: 'EMAIL_EXISTS'
        });
      }
    }

    // Handle password change
    let passwordHash = user.password_hash;
    if (newPassword) {
      // Validate current password
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is required to set a new password',
          code: 'VALIDATION_ERROR'
        });
      }

      const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect',
          code: 'INVALID_PASSWORD'
        });
      }

      // Validate new password length
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters',
          code: 'VALIDATION_ERROR'
        });
      }

      // Hash new password
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    await db.runAsync(
      `UPDATE users
       SET email = ?, first_name = ?, last_name = ?, password_hash = ?
       WHERE id = ?`,
      [email, firstName || null, lastName || null, passwordHash, req.user.id]
    );

    // Return updated user info
    const updatedUser = await db.getAsync(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        createdAt: updatedUser.created_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      code: 'SERVER_ERROR'
    });
  }
};
