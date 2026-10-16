import { AuthProvider } from '@/lib/admin/AuthContext';

export const metadata = {
  title: 'Admin — Amrooz Collection',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-secondary">{children}</div>
    </AuthProvider>
  );
}
