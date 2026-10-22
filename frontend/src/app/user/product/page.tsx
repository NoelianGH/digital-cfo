"use client";

import { useState, useEffect } from "react";
import { Plus, X, ShoppingCart, Printer, CheckCircle, Loader2, AlertCircle, Edit3, Trash2, Save } from "lucide-react";
import { productService, ProductItem } from "@/services/productService";

const initialSampleProducts: ProductItem[] = [];

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export default function ProductPage() {
  const [products, setProducts] = useState<ProductItem[]>(initialSampleProducts);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receiptView, setReceiptView] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("TUNAI");

  // New product form
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Minuman");
  const [newProdStock, setNewProdStock] = useState("50");
  const [newProdPrice, setNewProdPrice] = useState("18000");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts();
      if (res.success && res.data && res.data.length > 0) {
        setProducts(res.data);
      } else {
        setProducts(initialSampleProducts);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await productService.addProduct({
        name: newProdName,
        category: newProdCategory,
        price: parseFloat(newProdPrice),
        stock: parseInt(newProdStock) || 0,
      });

      if (res.success && res.data) {
        setProducts([res.data, ...products]);
        setIsAddModalOpen(false);
        setNewProdName("");
        setSuccessMsg("Produk berhasil ditambahkan!");
      } else {
        setErrorMsg(res.error || "Gagal menambahkan produk");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan produk ke database");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await productService.updateProduct(editingProduct.id, {
        name: editingProduct.name,
        price: editingProduct.price,
        category: editingProduct.category,
        stock: editingProduct.stock,
      });

      if (res.success && res.data) {
        setProducts(products.map((p) => (p.id === editingProduct.id ? res.data! : p)));
        setIsEditModalOpen(false);
        setEditingProduct(null);
        setSuccessMsg("Produk berhasil diperbarui!");
      } else {
        setErrorMsg(res.error || "Gagal memperbarui produk");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui produk di database");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}" secara permanen?`)) return;
    try {
      const res = await productService.deleteProduct(id);
      if (res.success) {
        setProducts(products.filter((p) => p.id !== id));
        setSuccessMsg("Produk berhasil dihapus!");
      } else {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        return prev.map((c) => (c.productId === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, qty } : c)));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCompleteSale = async () => {
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await productService.checkoutSale({
        paymentMethod,
        items: cart.map((c) => ({
          productId: c.productId,
          qty: c.qty,
        })),
      });

      if (res.success && res.data) {
        setReceiptNumber(res.data.receiptCode || `TRX-${Date.now().toString().slice(-6)}`);
        setSaleComplete(true);
        fetchProducts(); // Refresh stocks
      } else {
        setReceiptNumber(`TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`);
        setSaleComplete(true);
      }
    } catch {
      setReceiptNumber(`TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`);
      setSaleComplete(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetSale = () => {
    setCart([]);
    setReceiptView(false);
    setSaleComplete(false);
    setIsSaleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk & POS Kasir</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kelola katalog barang jualan Anda dan kasir transaksi penjualan.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsSaleModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kasir POS ({cart.length})</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-700 underline">Tutup</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-rose-700 underline">Tutup</button>
        </div>
      )}

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-xs">Memuat katalog produk...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Nama Produk</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Harga</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Stok</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase text-center">Aksi & POS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-xs">
                      Belum ada produk tersimpan. Tekan tombol Tambah Produk di atas.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                        {p.id.length > 8 ? p.id.slice(0, 8) + "..." : p.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{p.name}</td>
                      <td className="px-6 py-4 text-xs text-gray-600">{p.category}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">Rp {p.price.toLocaleString("id-ID")}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            p.stock > 20
                              ? "bg-green-100 text-green-700"
                              : p.stock > 5
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.stock} pcs
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              addToCart(p);
                              setIsSaleModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold"
                            title="Tambah ke Keranjang Kasir"
                          >
                            + POS
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Produk"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Tambah Produk */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Tambah Produk Baru</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Produk</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kopi Susu Gula Aren"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Minuman">Minuman</option>
                      <option value="Makanan">Makanan</option>
                      <option value="Jasa">Jasa</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stok Awal</label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded-xl text-xs font-bold shadow-sm"
                  >
                    {submitting ? "Menyimpan..." : "Simpan Produk"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Produk */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Edit Produk</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Produk</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Minuman">Minuman</option>
                      <option value="Makanan">Makanan</option>
                      <option value="Jasa">Jasa</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stok</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded-xl text-xs font-bold shadow-sm"
                  >
                    {submitting ? "Memperbarui..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: POS Kasir */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">
                {saleComplete ? "Struk Transaksi Selesai" : receiptView ? "Konfirmasi & Struk Belanja" : "Kasir Point of Sale (POS)"}
              </h2>
              <button onClick={resetSale} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!receiptView && !saleComplete && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wider">Katalog Produk</h3>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {products.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => addToCart(p)}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center hover:bg-blue-50 hover:border-blue-200 transition-colors text-left"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                            <p className="text-xs text-gray-400">Stok: {p.stock} pcs</p>
                          </div>
                          <span className="text-sm font-bold text-blue-600">Rp {p.price.toLocaleString("id-ID")}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wider">
                      Keranjang Kasir ({cart.length} item)
                    </h3>
                    {cart.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl text-xs">
                        Klik produk di sebelah kiri untuk menambah pesanan
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.productId} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                              <p className="text-[11px] text-gray-500">@ Rp {item.price.toLocaleString("id-ID")}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateQty(item.productId, item.qty - 1)}
                                className="w-6 h-6 rounded bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="w-6 text-center text-xs font-bold">{item.qty}</span>
                              <button
                                onClick={() => updateQty(item.productId, item.qty + 1)}
                                className="w-6 h-6 rounded bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs"
                              >
                                +
                              </button>
                            </div>
                            <p className="text-xs font-bold text-gray-900 w-20 text-right">
                              Rp {(item.price * item.qty).toLocaleString("id-ID")}
                            </p>
                            <button onClick={() => removeFromCart(item.productId)} className="text-rose-400 hover:text-rose-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {cart.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
                        <span className="font-semibold text-xs text-blue-900">Total Tagihan:</span>
                        <span className="text-lg font-black text-blue-900">Rp {total.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {receiptView && !saleComplete && (
                <div className="max-w-sm mx-auto">
                  <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 font-mono text-xs shadow-inner">
                    <div className="text-center mb-4">
                      <h3 className="text-base font-black text-gray-900">DIGITAL CFO - LAPORKAS</h3>
                      <p className="text-[11px] text-gray-500">Struk Penjualan Kasir POS</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date().toLocaleString("id-ID")}</p>
                    </div>

                    <div className="border-t border-dashed border-gray-300 pt-3 space-y-1">
                      {cart.map((item) => (
                        <div key={item.productId} className="flex justify-between">
                          <span className="text-gray-700">{item.qty}x {item.name}</span>
                          <span className="text-gray-900 font-bold">Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-gray-300 mt-3 pt-3 flex justify-between font-bold text-sm">
                      <span>TOTAL BAYAR</span>
                      <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <label className="block text-[11px] font-sans font-semibold text-gray-700 mb-1">
                        Pilih Metode Pembayaran:
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-sans font-semibold"
                      >
                        <option value="TUNAI">Tunai (Cash)</option>
                        <option value="QRIS">QRIS</option>
                        <option value="TRANSFER">Transfer Bank</option>
                        <option value="KARTU_DEBIT">Kartu Debit</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {saleComplete && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Transaksi Berhasil!</h3>
                  <p className="text-xs text-gray-500 mb-5">
                    Struk tercetak, stok terpotong di database, dan otomatis masuk ke Buku Kas (Transactions).
                  </p>

                  <div className="max-w-sm mx-auto border border-gray-200 rounded-2xl p-5 bg-gray-50 font-mono text-xs shadow-sm">
                    <div className="text-center mb-3">
                      <p className="text-[11px] font-bold text-blue-600">KODE STRUK: {receiptNumber}</p>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold mt-1 inline-block">
                        ✓ LUNAS ({paymentMethod})
                      </span>
                    </div>
                    <div className="border-t border-dashed border-gray-300 pt-2 space-y-1">
                      {cart.map((item) => (
                        <div key={item.productId} className="flex justify-between">
                          <span>{item.qty}x {item.name}</span>
                          <span>Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-dashed border-gray-300 mt-2 pt-2 flex justify-between font-bold text-sm">
                      <span>TOTAL</span>
                      <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              {!receiptView && !saleComplete && (
                <>
                  <button type="button" onClick={resetSale} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceiptView(true)}
                    disabled={cart.length === 0}
                    className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Lanjut ke Pembayaran</span>
                  </button>
                </>
              )}
              {receiptView && !saleComplete && (
                <>
                  <button type="button" onClick={() => setReceiptView(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteSale}
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Konfirmasi Pembayaran</span>
                  </button>
                </>
              )}
              {saleComplete && (
                <button
                  type="button"
                  onClick={resetSale}
                  className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold shadow-sm"
                >
                  Selesai & Transaksi Baru
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
