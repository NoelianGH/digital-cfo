const prisma = require()

exports.cashRunaway = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
        orderBy: { date: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    });