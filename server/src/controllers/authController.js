const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET } = require('../middleware/auth');

function makeDefaultAvatar(name, role) {
  const initials = (name || 'KN')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const bg = role === 'WORKER' ? '#0f766e' : '#1e3a8a';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="32" fill="${bg}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-size="72" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res, next) {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'CUSTOMER',
      address,
      city = 'Bengaluru',
      latitude,
      longitude,
      profession = 'Electrician',
      experienceYears = 2,
      visitCharge = 199,
      serviceArea = 'Bengaluru',
      skills = [],
      bio = '',
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone number, and password are required.',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const normalizedRole = role === 'WORKER' ? 'WORKER' : 'CUSTOMER';
    const passwordHash = await bcrypt.hash(String(password), 10);

    const lat = latitude !== undefined && latitude !== '' ? Number(latitude) : 12.9716;
    const lng = longitude !== undefined && longitude !== '' ? Number(longitude) : 77.6412;

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: String(name).trim(),
          email: normalizedEmail,
          phone: String(phone).trim(),
          passwordHash,
          role: normalizedRole,
          avatarUrl: makeDefaultAvatar(name, normalizedRole),
          address: address || 'Indiranagar, Bengaluru',
          city,
          latitude: lat,
          longitude: lng,
        },
      });

      if (normalizedRole === 'WORKER') {
        const parsedSkills = Array.isArray(skills) && skills.length > 0
          ? skills
          : [profession, 'General Inspection & Repair', 'Doorstep Service'];

        const profile = await tx.workerProfile.create({
          data: {
            userId: user.id,
            profession: profession || 'Electrician',
            bio:
              bio ||
              `Dedicated ${profession || 'Skilled'} KaamSaathi providing reliable doorstep service across ${serviceArea || 'Bengaluru'}.`,
            experienceYears: Number(experienceYears) || 2,
            visitCharge: Number(visitCharge) || 199,
            serviceRadiusKm: 18,
            serviceArea: serviceArea || 'Bengaluru',
            skills: parsedSkills,
            portfolioImages: [],
            availabilitySchedule: 'Mon - Sun: 8:00 AM - 8:00 PM',
            isOnline: true,
            isVerified: true,
          },
        });

        await tx.workerLocation.create({
          data: {
            workerProfileId: profile.id,
            latitude: lat,
            longitude: lng,
            heading: 0,
            speed: 0,
          },
        });

        // Automatically attach services matching their chosen profession category
        const matchingCategory = await tx.serviceCategory.findFirst({
          where: {
            name: {
              equals: profession || 'Electrician',
              mode: 'insensitive',
            },
          },
          include: { services: true },
        });

        if (matchingCategory && matchingCategory.services.length > 0) {
          for (const svc of matchingCategory.services) {
            await tx.workerService.create({
              data: {
                workerProfileId: profile.id,
                serviceId: svc.id,
                customPrice: Number(visitCharge) || svc.basePrice,
              },
            });
          }
        }
      }

      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          workerProfile: {
            include: {
              location: true,
              workerServices: { include: { service: true } },
            },
          },
        },
      });
    });

    const token = signToken(createdUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: sanitizeUser(createdUser),
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        workerProfile: {
          include: {
            location: true,
            workerServices: { include: { service: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        workerProfile: {
          include: {
            location: true,
            workerServices: { include: { service: true } },
          },
        },
      },
    });

    return res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, phone, address, city, avatarUrl, latitude, longitude } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(phone !== undefined && { phone: String(phone).trim() }),
        ...(address !== undefined && { address: String(address).trim() }),
        ...(city !== undefined && { city: String(city).trim() }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(latitude !== undefined && latitude !== '' && { latitude: Number(latitude) }),
        ...(longitude !== undefined && longitude !== '' && { longitude: Number(longitude) }),
      },
      include: {
        workerProfile: {
          include: {
            location: true,
            workerServices: { include: { service: true } },
          },
        },
      },
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
