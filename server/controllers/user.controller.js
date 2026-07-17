import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Listing from '../models/listing.model.js';
import { createError } from '../utils/error.js';

export const updateUser = async (req, res, next) => {
  if (req.user.userId !== req.params.id) {
    return next(createError(403, 'You can only update your own account.'));
  }
  try {
    const { username, email, password, avatar } = req.body;
    const updateFields = {};

    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (avatar !== undefined) updateFields.avatar = avatar;

    if (password) {
      if (password.length < 6) {
        return next(createError(400, 'Password must be at least 6 characters long.'));
      }
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return next(createError(404, 'User not found.'));
    }

    const { password: _password, ...userData } = updatedUser.toObject();

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.userId !== req.params.id) {
    return next(createError(403, 'You can only delete your own account.'));
  }
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return next(createError(404, 'User not found.'));
    }
    // Delete all listings associated with this user as well
    await Listing.deleteMany({ userRef: req.params.id });

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'User account and associated listings deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.userId !== req.params.id) {
    return next(createError(403, 'You can only view your own listings.'));
  }
  try {
    const listings = await Listing.find({ userRef: req.params.id });
    res.status(200).json({
      success: true,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(createError(404, 'User not found.'));
    }
    const { password: _password, ...userData } = user.toObject();
    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

