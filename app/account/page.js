'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-12 text-primary">My Account</h1>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="text-lg">customer@example.com</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <p className="text-lg">Customer Name</p>
            </div>
            
            <div className="pt-6 space-y-3">
              <Link 
                href="/account/orders" 
                className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-opacity-90 transition"
              >
                My Orders
              </Link>
              
              <Link 
                href="/account/settings" 
                className="block w-full border border-primary text-primary text-center py-3 rounded-lg hover:bg-primary hover:text-white transition"
              >
                Account Settings
              </Link>
              
              <button
                onClick={() => router.push('/')}
                className="block w-full border border-gray-300 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-100 transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
