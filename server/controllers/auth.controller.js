import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { createError } from '../utils/error.js';

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'devsecret', {
    expiresIn: '7d',
  });
};

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(createError(400, 'All fields are required.'));
    }

    if (password.length < 6) {
      return next(createError(400, 'Password must be at least 6 characters long.'));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(409, 'Email already exists.'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = createToken(newUser._id);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _password, ...userData } = newUser.toObject();

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: userData,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError(400, 'Email and password are required.'));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(401, 'Invalid email or password.'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createError(401, 'Invalid email or password.'));
    }

    const token = createToken(user._id);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _password, ...userData } = user.toObject();

    res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      user: userData,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const signout = (_req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
};
