const prisma = require('../config/prisma');
const { calculateDistanceKm } = require('../utils/geo');

function formatWorkerPublic(workerProfile, customerLat = null, customerLng = null) {
  if (!workerProfile) return null;
  const workerLat = workerProfile.location?.latitude ?? workerProfile.user?.latitude;
  const workerLng = workerProfile.location?.longitude ?? workerProfile.user?.longitude;

  let distanceKm = null;
  if (customerLat !== null && customerLng !== null && workerLat !== null && workerLng !== null) {
    distanceKm = calculateDistanceKm(
      Number(customerLat),
      Number(customerLng),
      Number(workerLat),
      Number(workerLng)
    );
  }

  return {
    id: workerProfile.id,
    userId: workerProfile.userId,
    name: workerProfile.user?.name,
    avatarUrl: workerProfile.user?.avatarUrl,
    city: workerProfile.user?.city || 'Bengaluru',
    profession: workerProfile.profession,
    bio: workerProfile.bio,
    experienceYears: workerProfile.experienceYears,
    visitCharge: workerProfile.visitCharge,
    serviceRadiusKm: workerProfile.serviceRadiusKm,
    serviceArea: workerProfile.serviceArea,
    skills: workerProfile.skills || [],
    portfolioImages: workerProfile.portfolioImages || [],
    availabilitySchedule: workerProfile.availabilitySchedule,
    isOnline: workerProfile.isOnline,
    isVerified: workerProfile.isVerified,
    averageRating: Number((workerProfile.averageRating || 0).toFixed(1)),
    totalReviews: workerProfile.totalReviews || 0,
    completedJobsCount: workerProfile.completedJobsCount || 0,
    distanceKm,
    location: workerProfile.location
      ? {
          latitude: workerProfile.location.latitude,
          longitude: workerProfile.location.longitude,
          updatedAt: workerProfile.location.updatedAt,
        }
      : workerLat && workerLng
      ? { latitude: workerLat, longitude: workerLng }
      : null,
    services: (workerProfile.workerServices || []).map((ws) => ({
      id: ws.service.id,
      name: ws.service.name,
      slug: ws.service.slug,
      description: ws.service.description,
      basePrice: ws.service.basePrice,
      customPrice: ws.customPrice,
      estimatedDuration: ws.service.estimatedDuration,
    })),
    reviews: (workerProfile.reviews || []).map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      customerName: r.customer?.name || 'Verified Customer',
      customerAvatar: r.customer?.avatarUrl,
    })),
  };
}

async function getWorkers(req, res, next) {
  try {
    const {
      search,
      profession,
      serviceId,
      minRating,
      maxPrice,
      maxDistance,
      onlineOnly,
      lat,
      lng,
      sortBy = 'recommended',
    } = req.query;

    const where = {};

    if (onlineOnly === 'true') {
      where.isOnline = true;
    }

    if (profession && profession !== 'ALL') {
      where.profession = {
        contains: String(profession).trim(),
        mode: 'insensitive',
      };
    }

    if (serviceId) {
      where.workerServices = {
        some: {
          serviceId: Number(serviceId),
        },
      };
    }

    if (minRating) {
      where.averageRating = {
        gte: Number(minRating),
      };
    }

    if (maxPrice) {
      where.visitCharge = {
        lte: Number(maxPrice),
      };
    }

    if (search && String(search).trim() !== '') {
      const q = String(search).trim();
      where.OR = [
        { profession: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
        { serviceArea: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { skills: { hasSome: [q] } },
        {
          workerServices: {
            some: {
              service: {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } },
                ],
              },
            },
          },
        },
      ];
    }

    const profiles = await prisma.workerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
        location: true,
        workerServices: {
          include: {
            service: true,
          },
        },
        reviews: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    const customerLat = lat !== undefined && lat !== '' ? Number(lat) : 12.9716;
    const customerLng = lng !== undefined && lng !== '' ? Number(lng) : 77.6412;

    let formatted = profiles.map((p) => formatWorkerPublic(p, customerLat, customerLng));

    // Also allow case-insensitive skill partial matching when searching
    if (search && String(search).trim() !== '' && formatted.length === 0) {
      const allProfiles = await prisma.workerProfile.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              city: true,
              latitude: true,
              longitude: true,
            },
          },
          location: true,
          workerServices: { include: { service: true } },
          reviews: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { customer: { select: { id: true, name: true, avatarUrl: true } } },
          },
        },
      });
      const qLower = String(search).trim().toLowerCase();
      formatted = allProfiles
        .filter((p) =>
          (p.skills || []).some((s) => s.toLowerCase().includes(qLower)) ||
          p.profession.toLowerCase().includes(qLower)
        )
        .map((p) => formatWorkerPublic(p, customerLat, customerLng));
    }

    if (maxDistance && Number(maxDistance) > 0) {
      formatted = formatted.filter(
        (w) => w.distanceKm === null || w.distanceKm <= Number(maxDistance)
      );
    }

    // Sort results
    formatted.sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      }
      if (sortBy === 'price_low') {
        return a.visitCharge - b.visitCharge;
      }
      if (sortBy === 'price_high') {
        return b.visitCharge - a.visitCharge;
      }
      if (sortBy === 'rating') {
        return b.averageRating - a.averageRating;
      }
      if (sortBy === 'experience') {
        return b.experienceYears - a.experienceYears;
      }
      // Default recommended: Online first, then high rating, then proximity
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
      return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    });

    return res.json({
      success: true,
      count: formatted.length,
      workers: formatted,
    });
  } catch (error) {
    next(error);
  }
}

async function getWorkerById(req, res, next) {
  try {
    const workerId = Number(req.params.id);
    if (Number.isNaN(workerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID.',
      });
    }

    const profile = await prisma.workerProfile.findUnique({
      where: { id: workerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            city: true,
            latitude: true,
            longitude: true,
            createdAt: true,
          },
        },
        location: true,
        workerServices: {
          include: {
            service: true,
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: { id: true, name: true, avatarUrl: true },
            },
            booking: {
              select: {
                id: true,
                bookingNumber: true,
                service: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found.',
      });
    }

    const { lat, lng } = req.query;
    const customerLat = lat ? Number(lat) : 12.9716;
    const customerLng = lng ? Number(lng) : 77.6412;

    const formatted = formatWorkerPublic(profile, customerLat, customerLng);
    formatted.memberSince = profile.user?.createdAt;

    return res.json({
      success: true,
      worker: formatted,
    });
  } catch (error) {
    next(error);
  }
}

async function upsertWorkerProfile(req, res, next) {
  try {
    const {
      name,
      phone,
      avatarUrl,
      profession,
      bio,
      experienceYears,
      visitCharge,
      serviceRadiusKm,
      serviceArea,
      skills,
      portfolioImages,
      availabilitySchedule,
      isOnline,
      latitude,
      longitude,
      serviceIds,
    } = req.body;

    // Update basic User fields if provided
    if (name || phone || avatarUrl || latitude !== undefined || longitude !== undefined) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(name && { name: String(name).trim() }),
          ...(phone && { phone: String(phone).trim() }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(latitude !== undefined && latitude !== '' && { latitude: Number(latitude) }),
          ...(longitude !== undefined && longitude !== '' && { longitude: Number(longitude) }),
        },
      });
    }

    const cleanSkills = Array.isArray(skills)
      ? skills.map((s) => String(s).trim()).filter(Boolean)
      : typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const cleanPortfolio = Array.isArray(portfolioImages)
      ? portfolioImages.map((u) => String(u).trim()).filter(Boolean)
      : undefined;

    const existingProfile = await prisma.workerProfile.findUnique({
      where: { userId: req.user.id },
    });

    let profile;
    if (existingProfile) {
      profile = await prisma.workerProfile.update({
        where: { userId: req.user.id },
        data: {
          ...(profession !== undefined && { profession: String(profession).trim() }),
          ...(bio !== undefined && { bio: String(bio).trim() }),
          ...(experienceYears !== undefined && { experienceYears: Number(experienceYears) }),
          ...(visitCharge !== undefined && { visitCharge: Number(visitCharge) }),
          ...(serviceRadiusKm !== undefined && { serviceRadiusKm: Number(serviceRadiusKm) }),
          ...(serviceArea !== undefined && { serviceArea: String(serviceArea).trim() }),
          ...(cleanSkills !== undefined && { skills: cleanSkills }),
          ...(cleanPortfolio !== undefined && { portfolioImages: cleanPortfolio }),
          ...(availabilitySchedule !== undefined && { availabilitySchedule: String(availabilitySchedule).trim() }),
          ...(isOnline !== undefined && { isOnline: Boolean(isOnline) }),
        },
      });
    } else {
      profile = await prisma.workerProfile.create({
        data: {
          userId: req.user.id,
          profession: profession || 'Electrician',
          bio: bio || 'Experienced professional on KaamNow.',
          experienceYears: Number(experienceYears) || 2,
          visitCharge: Number(visitCharge) || 199,
          serviceRadiusKm: Number(serviceRadiusKm) || 15,
          serviceArea: serviceArea || 'Bengaluru',
          skills: cleanSkills || [profession || 'Electrician'],
          portfolioImages: cleanPortfolio || [],
          availabilitySchedule: availabilitySchedule || 'Mon - Sun: 8:00 AM - 8:00 PM',
          isOnline: isOnline !== undefined ? Boolean(isOnline) : true,
          isVerified: true,
        },
      });
    }

    // Update latest worker location if coordinates passed
    if (latitude !== undefined && longitude !== undefined && latitude !== '' && longitude !== '') {
      await prisma.workerLocation.upsert({
        where: { workerProfileId: profile.id },
        update: {
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        create: {
          workerProfileId: profile.id,
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
      });
    }

    // Update workerServices if serviceIds array provided, or sync with profession category
    if (Array.isArray(serviceIds) && serviceIds.length > 0) {
      await prisma.workerService.deleteMany({
        where: { workerProfileId: profile.id },
      });
      for (const sId of serviceIds) {
        await prisma.workerService.create({
          data: {
            workerProfileId: profile.id,
            serviceId: Number(sId),
            customPrice: profile.visitCharge,
          },
        });
      }
    } else if (profession) {
      const cat = await prisma.serviceCategory.findFirst({
        where: { name: { equals: String(profession).trim(), mode: 'insensitive' } },
        include: { services: true },
      });
      if (cat && cat.services.length > 0) {
        await prisma.workerService.deleteMany({
          where: { workerProfileId: profile.id },
        });
        for (const svc of cat.services) {
          await prisma.workerService.create({
            data: {
              workerProfileId: profile.id,
              serviceId: svc.id,
              customPrice: profile.visitCharge,
            },
          });
        }
      }
    }

    const fullProfile = await prisma.workerProfile.findUnique({
      where: { id: profile.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            city: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        location: true,
        workerServices: { include: { service: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });

    return res.json({
      success: true,
      message: 'Professional profile saved successfully.',
      workerProfile: fullProfile,
    });
  } catch (error) {
    next(error);
  }
}

async function toggleAvailability(req, res, next) {
  try {
    const { isOnline, availabilitySchedule, latitude, longitude } = req.body;

    const existing = await prisma.workerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found. Please create your profile first.',
      });
    }

    const nextOnlineState =
      isOnline !== undefined ? Boolean(isOnline) : !existing.isOnline;

    const updated = await prisma.workerProfile.update({
      where: { id: existing.id },
      data: {
        isOnline: nextOnlineState,
        ...(availabilitySchedule !== undefined && { availabilitySchedule }),
      },
      include: {
        location: true,
        workerServices: { include: { service: true } },
      },
    });

    if (latitude !== undefined && longitude !== undefined) {
      await prisma.workerLocation.upsert({
        where: { workerProfileId: existing.id },
        update: {
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        create: {
          workerProfileId: existing.id,
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
      });
    }

    return res.json({
      success: true,
      message: updated.isOnline
        ? 'You are now ONLINE and ready to receive job requests.'
        : 'You are now OFFLINE.',
      workerProfile: updated,
    });
  } catch (error) {
    next(error);
  }
}

async function updateWorkerLocation(req, res, next) {
  try {
    const { latitude, longitude, heading, speed, bookingId } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required.',
      });
    }

    const profile = await prisma.workerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found.',
      });
    }

    const location = await prisma.workerLocation.upsert({
      where: { workerProfileId: profile.id },
      update: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        heading: heading !== undefined ? Number(heading) : null,
        speed: speed !== undefined ? Number(speed) : null,
      },
      create: {
        workerProfileId: profile.id,
        latitude: Number(latitude),
        longitude: Number(longitude),
        heading: heading !== undefined ? Number(heading) : null,
        speed: speed !== undefined ? Number(speed) : null,
      },
    });

    const io = req.app.get('io');
    if (io && bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: Number(bookingId) },
      });

      if (
        booking &&
        booking.workerProfileId === profile.id &&
        ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status)
      ) {
        io.to(`booking:${booking.id}`).emit('booking:location', {
          bookingId: booking.id,
          workerProfileId: profile.id,
          latitude: location.latitude,
          longitude: location.longitude,
          heading: location.heading,
          speed: location.speed,
          updatedAt: location.updatedAt,
        });
      }
    }

    return res.json({
      success: true,
      location,
    });
  } catch (error) {
    next(error);
  }
}

async function getWorkerDashboardStats(req, res, next) {
  try {
    const profile = await prisma.workerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        location: true,
        workerServices: { include: { service: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, avatarUrl: true } },
            booking: {
              select: {
                id: true,
                bookingNumber: true,
                service: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found.',
      });
    }

    const [pendingRequests, activeJobs, completedBookings] = await Promise.all([
      prisma.booking.findMany({
        where: {
          currentCandidateWorkerId: profile.id,
          status: 'REQUESTED',
        },
        include: {
          service: { include: { category: true } },
          customer: { select: { id: true, name: true, phone: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.findMany({
        where: {
          workerProfileId: profile.id,
          status: { in: ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'] },
        },
        include: {
          service: { include: { category: true } },
          customer: { select: { id: true, name: true, phone: true, avatarUrl: true } },
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.booking.findMany({
        where: {
          workerProfileId: profile.id,
          status: 'COMPLETED',
        },
        include: {
          service: { include: { category: true } },
          customer: { select: { id: true, name: true, avatarUrl: true } },
          review: true,
        },
        orderBy: { completedAt: 'desc' },
      }),
    ]);

    const calculatedCompletedEarnings = completedBookings.reduce(
      (sum, b) => sum + (b.finalAmount || b.visitCharge || 0),
      0
    );

    return res.json({
      success: true,
      profile,
      pendingRequests,
      activeJobs,
      completedBookings,
      stats: {
        isOnline: profile.isOnline,
        averageRating: Number((profile.averageRating || 0).toFixed(1)),
        totalReviews: profile.totalReviews,
        completedJobsCount: profile.completedJobsCount,
        totalEarnings: Math.max(profile.totalEarnings || 0, calculatedCompletedEarnings),
        recentJobsEarnings: calculatedCompletedEarnings,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWorkers,
  getWorkerById,
  upsertWorkerProfile,
  toggleAvailability,
  updateWorkerLocation,
  getWorkerDashboardStats,
};
