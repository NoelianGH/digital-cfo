const prisma = require('../config/database');

exports.addSales = async (req, res) => {
  try {
    const { paymentMethod, items } = req.body;
    const userId = req.user.userId;

    if(!items || items.length === 0){
        return res.status(400).json({ success: false, error: 'Items are required' }); 
    }

    const productIds = items.map((item) => item.productId);

    const productsInDb = await prisma.product.findMany({
        where: {
            id: {in: productIds},
            userId: userId,
        },
    });

    let totalAmount = 0;
    const itemsDetailInDb = [];

    for (const item of items){
        const product = productsInDb.find((p) => p.id === item.productId);

        if (!product){
            return res.status(404).json({
                success: false,
                error: `Produk dengan ID ${item.productId} tidak ditemukan`
            });
        }

        if (product.stock < item.qty) {
            return res.status(400).json({
                success: false,
                error: `Stok untuk "${product.name}" tidak mencukupi (Sisa: ${product.stock}, Diminta:${item.qty})`
            });
        }
        const subtotal = product.price * item.qty;
        totalAmount += subtotal;

        itemsDetailInDb.push({
            productId: product.id,
            qty: item.qty,
            priceAtSale: product.price,
            subtotal: subtotal,
        });
    }
    // 4. Generate 1 nomor struk unik untuk transaksi ini
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const receiptCode = `TRX-${dateStr}-${randomNum}`;
    // 5. Eksekusi 3 hal bersamaan di Database
    const result = await prisma.$transaction(async (tx) => {
      // A. Otomatis catat ke Buku Kas (Transactions)
      const cashTransaction = await tx.transaction.create({
        data: {
          date: new Date(),
          description: `Penjualan Kasir - Struk #${receiptCode}`,
          amount: totalAmount,
          type: 'MASUK',
          category: 'PENJUALAN',
          source: 'POS',
          paymentMethod: paymentMethod || 'TUNAI',
          status: 'VERIFIED',
          userId: userId,
        },
      });
      // B. Buat data Struk Penjualan & detail itemnya
      const sale = await tx.sale.create({
        data: {
          total: totalAmount,
          paymentMethod: paymentMethod || 'TUNAI',
          receiptCode: receiptCode,
          transactionId: cashTransaction.id, // Terhubung ke kas di atas
          items: {
            create: itemsDetailInDb, // Detail barang-barang yang dibeli
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
      // C. Potong stok tiap produk yang terjual
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.qty }, // Otomatis kurangi stok
          },
        });
      }
      return sale; // Kembalikan data struk lengkap
    });
    // 6. Kirim data struk ke frontend untuk dicetak/ditampilkan
    return res.status(201).json({success: true, message: 'Transaksi kasir berhasil, struk tercetak & otomatis masuk pembukuan kas', data: result, });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};