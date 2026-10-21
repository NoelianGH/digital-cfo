import { FileText, Download } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Template Keuangan UMKM</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unduh berbagai macam template Excel dan Google Sheets gratis yang telah kami sesuaikan untuk kebutuhan bisnis Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: "Template Arus Kas (Cash Flow) Harian", desc: "Format standar untuk mencatat pemasukan dan pengeluaran per hari." },
          { title: "Template Laporan Laba Rugi Bulanan", desc: "Ketahui performa untung/rugi bisnis Anda di akhir bulan dengan format ini." },
          { title: "Kalkulator Harga Pokok Penjualan (HPP)", desc: "Tentukan harga jual produk yang tepat agar tidak merugi." },
          { title: "Buku Rekap Hutang Piutang", desc: "Catat siapa saja yang berhutang pada Anda dan tagihan yang belum dibayar." }
        ].map((item, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{item.desc}</p>
              <button className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                <Download className="w-4 h-4" /> Unduh (XLSX)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
