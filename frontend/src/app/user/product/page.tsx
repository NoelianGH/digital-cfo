"use client";

import { useState } from "react";
import { Plus, X, ShoppingCart, Printer, CheckCircle } from "lucide-react";

// Dummy product data (nanti dari database)
const dummyProducts = [
  { id: "P001", name: "Kopi Susu Gula Aren", category: "Minuman", price: 18000, stock: 50 },
  { id: "P002", name: "Matcha Latte", category: "Minuman", price: 22000, stock: 30 },
  { id: "P003", name: "Roti Bakar Coklat", category: "Makanan", price: 15000, stock: 20 },
  { id: "P004", name: "Croissant Almond", category: "Makanan", price: 25000, stock: 15 },
];

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export default function ProductPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receiptView, setReceiptView] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);

  const addToCart = (product: typeof dummyProducts[0]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        return prev.map((c) => c.productId === product.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart((prev) => prev.map((c) => c.productId === productId ? { ...c, qty } : c));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCompleteSale = () => {
    // TODO: Panggil transactionService.completeSale() di sini
    // Untuk sekarang, tampilkan receipt view saja
    setSaleComplete(true);
  };

  const resetSale = () => {
    setCart([]);
    setReceiptView(false);
    setSaleComplete(false);
    setIsSaleModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manajemen Produk</h1>
          <p className="text-gray-500">Lihat semua stok dan varian barang jualan Anda.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsSaleModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Transaksi</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Produk</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Harga</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stok</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {dummyProducts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{p.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900">Rp {p.price.toLocaleString("id-ID")}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock > 20 ? 'bg-green-100 text-green-700' : p.stock > 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock} pcs
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === MODAL: Tambah Produk === */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Tambah Produk Baru</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                  <input type="text" placeholder="Contoh: Kopi Susu Gula Aren" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Minuman</option><option>Makanan</option><option>Jasa</option><option>Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
                    <input type="number" placeholder="50" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual (Rp)</label>
                  <input type="number" placeholder="18000" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Batal</button>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm">Simpan Produk</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL: Penjualan Baru (POS) === */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {saleComplete ? "Struk Digital" : receiptView ? "Preview Struk" : "Transaksi"}
              </h2>
              <button onClick={resetSale} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">

              {/* STEP 1: Pilih produk */}
              {!receiptView && !saleComplete && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Product list */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Pilih Produk</h3>
                    <div className="space-y-2">
                      {dummyProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => addToCart(p)}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center hover:bg-blue-50 hover:border-blue-200 transition-colors text-left"
                        >
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                            <p className="text-xs text-gray-500">Stok: {p.stock}</p>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">Rp {p.price.toLocaleString("id-ID")}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Cart */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Keranjang</h3>
                    {cart.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
                        Klik produk untuk menambahkan
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cart.map((item) => (
                          <div key={item.productId} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">@ Rp {item.price.toLocaleString("id-ID")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-7 h-7 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center font-bold text-sm">-</button>
                              <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                              <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-7 h-7 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center font-bold text-sm">+</button>
                            </div>
                            <p className="text-sm font-bold text-gray-900 w-24 text-right">Rp {(item.price * item.qty).toLocaleString("id-ID")}</p>
                            <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 ml-1"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
                          <span className="font-semibold text-blue-900">Total</span>
                          <span className="text-xl font-bold text-blue-900">Rp {total.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Preview struk sebelum bayar */}
              {receiptView && !saleComplete && (
                <div className="max-w-sm mx-auto">
                  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 font-mono text-sm">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">LAPORKAS!</h3>
                      <p className="text-xs text-gray-500">Struk Digital Penjualan</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleString("id-ID")}</p>
                    </div>
                    <div className="border-t border-dashed border-gray-300 pt-3 space-y-1">
                      {cart.map((item) => (
                        <div key={item.productId} className="flex justify-between">
                          <span className="text-gray-700">{item.qty}x {item.name}</span>
                          <span className="text-gray-900">Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-dashed border-gray-300 mt-3 pt-3 flex justify-between font-bold text-base">
                      <span>TOTAL</span>
                      <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-6">Metode Pembayaran: Tunai</p>
                  </div>
                </div>
              )}

              {/* STEP 3: Sale complete confirmation */}
              {saleComplete && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h3>
                  <p className="text-gray-500 mb-8">Transaksi telah tercatat. Stok produk dan pembukuan kas akan otomatis terupdate.</p>
                  
                  <div className="max-w-sm mx-auto border border-gray-200 rounded-xl p-6 bg-gray-50 font-mono text-sm mb-6">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">LAPORKAS!</h3>
                      <p className="text-xs text-gray-500">Struk Digital Penjualan</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleString("id-ID")}</p>
                    </div>
                    <div className="border-t border-dashed border-gray-300 pt-3 space-y-1">
                      {cart.map((item) => (
                        <div key={item.productId} className="flex justify-between">
                          <span className="text-gray-700">{item.qty}x {item.name}</span>
                          <span className="text-gray-900">Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-dashed border-gray-300 mt-3 pt-3 flex justify-between font-bold text-base">
                      <span>TOTAL</span>
                      <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="mt-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ LUNAS</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              {!receiptView && !saleComplete && (
                <>
                  <button type="button" onClick={resetSale} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Batal</button>
                  <button 
                    type="button" 
                    onClick={() => setReceiptView(true)} 
                    disabled={cart.length === 0}
                    className="px-5 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Lihat Struk
                  </button>
                </>
              )}
              {receiptView && !saleComplete && (
                <>
                  <button type="button" onClick={() => setReceiptView(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Kembali</button>
                  <button 
                    type="button" 
                    onClick={handleCompleteSale}
                    className="px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" /> Pembayaran Selesai
                  </button>
                </>
              )}
              {saleComplete && (
                <button type="button" onClick={resetSale} className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm">Tutup & Selesai</button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
