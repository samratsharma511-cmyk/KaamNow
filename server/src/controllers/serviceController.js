const prisma = require('../config/prisma');

async function getCategories(req, res, next) {
  try {
    const categories = await prisma.serviceCategory.findMany({
      include: {
        services: {
          orderBy: { basePrice: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    const workersByProfession = await prisma.workerProfile.groupBy({
      by: ['profession'],
      _count: { id: true },
      where: { isOnline: true },
    });

    const countMap = {};
    for (const item of workersByProfession) {
      countMap[item.profession.toLowerCase()] = item._count.id;
    }

    const enriched = categories.map((cat) => ({
      ...cat,
      onlineWorkersCount: countMap[cat.name.toLowerCase()] || 0,
    }));

    return res.json({
      success: true,
      categories: enriched,
    });
  } catch (error) {
    next(error);
  }
}

async function getServices(req, res, next) {
  try {
    const { category, categoryId, search } = req.query;

    const where = {};

    if (categoryId) {
      where.categoryId = Number(categoryId);
    } else if (category) {
      where.category = {
        OR: [
          { slug: { equals: String(category), mode: 'insensitive' } },
          { name: { contains: String(category), mode: 'insensitive' } },
        ],
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        {
          category: {
            name: { contains: String(search), mode: 'insensitive' },
          },
        },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [{ categoryId: 'asc' }, { basePrice: 'asc' }],
    });

    return res.json({
      success: true,
      services,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getServices,
};
