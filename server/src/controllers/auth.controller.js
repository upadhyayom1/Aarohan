import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { generateToken } from '../utils/token.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email already exists',
        details: {},
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: role || 'student',
      },
    });

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to register user',
      details: {},
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        details: {},
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        details: {},
      });
    }

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to login',
      details: {},
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const { id, name, email, role } = req.user;

    return res.status(200).json({
      id,
      name,
      email,
      role,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch current user',
      details: {},
    });
  }
};

