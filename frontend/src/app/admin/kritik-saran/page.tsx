"use client";
import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';

interface FeedbackItem {
  id: string;
  rating: string; // FeedbackRating enum string
  comment?: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminKritikSaranPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    adminService.getFeedbacks().then((res) => {
      if (res.success && res.data) {
        setFeedbacks(res.data);
      }
    }).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Kritik dan Saran</h1>
      <p className="text-gray-500 mb-8">Baca umpan balik, komentar, dan rating dari pengguna aplikasi LaporKas!.</p>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Inbox Masukan</h3>
        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <p className="text-gray-600 text-sm">Belum ada feedback.</p>
          ) : (
            feedbacks.map((fb) => (
              <div key={fb.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{fb.user.name} ({'★'.repeat(Math.min(5, fb.rating === 'EXCELLENT' ? 5 : fb.rating === 'GOOD' ? 4 : fb.rating === 'AVERAGE' ? 3 : fb.rating === 'POOR' ? 2 : 1))})</h4>
                  <span className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-gray-600 text-sm">{fb.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}