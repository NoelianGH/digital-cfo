export default function AboutPage() {
  return (
    <div className="py-20 px-6 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center">
        Tentang LaporKas!
      </h1>
      
      <div className="prose prose-lg prose-blue mx-auto text-gray-600">
        <p className="mb-6">
          LaporKas! adalah inovasi terkini di bidang teknologi finansial yang didedikasikan untuk memberdayakan Usaha Mikro, Kecil, dan Menengah (UMKM) di seluruh Indonesia. Berdiri pada tahun 2026, kami melihat adanya kesenjangan yang besar antara teknologi pencatatan kas modern dengan realita keseharian para pelaku usaha kecil yang masih bergantung pada buku tulis manual.
        </p>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Visi Kami</h2>
        <p className="mb-6">
          Menciptakan ekosistem keuangan yang transparan, mudah diakses, dan cerdas bagi seluruh pelaku usaha tanpa memandang ukuran bisnis mereka. Kami memimpikan masa depan di mana tidak ada lagi UMKM yang bangkrut karena kesalahan manajerial kas.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Misi Kami</h2>
        <ul className="list-disc pl-6 mb-8 space-y-3">
          <li>Menyediakan alat pencatatan yang <strong>sederhana namun kuat</strong>, bisa diakses dari mana saja.</li>
          <li>Mengembangkan fitur kecerdasan buatan (AI) yang bertindak layaknya <em>Chief Financial Officer</em> (CFO) digital pribadi untuk membantu merumuskan keputusan finansial.</li>
          <li>Membangun komunitas pebisnis yang sadar akan pentingnya "Business Health Score".</li>
        </ul>

        <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 mt-12 text-center">
          <h3 className="text-xl font-bold text-blue-900 mb-2">Tertarik bekerja sama dengan kami?</h3>
          <p className="text-blue-700 mb-6">Kami selalu terbuka untuk kemitraan strategis.</p>
          <a href="mailto:halo@laporkas.id" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
            Hubungi Tim Kami
          </a>
        </div>
      </div>
    </div>
  );
}
