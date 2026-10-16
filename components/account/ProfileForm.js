'use client';

import { useState, useEffect } from 'react';
import { updateCustomerProfile, fetchCustomerMe } from '@/lib/auth/customerApi';
import { useToast } from '@/components/ui/ToastProvider';
import { useCustomerAuth } from '@/lib/auth/CustomerAuthContext';

export default function ProfileForm() {
  const { customer } = useCustomerAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCustomerProfile(formData);
      // Refresh customer data in context
      const updated = await fetchCustomerMe();
      if (updated) {
        setFormData({
          firstName: updated.firstName || '',
          lastName: updated.lastName || '',
          phone: updated.phone || '',
        });
      }
      showToast('Profile updated successfully', 'success');
      setEditing(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
      });
    }
    setEditing(false);
  };

  if (!customer) return null;

  return (
    <div className="rounded-[2rem] border border-black/5 bg-white p-6 sm:p-8 shadow-luxe">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl text-primary">Personal Information</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-medium text-accent-dark hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-2">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            disabled={!editing}
            required
            minLength={2}
            className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/40 focus:border-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-dark/20 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-primary mb-2">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            disabled={!editing}
            className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/40 focus:border-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-dark/20 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={!editing}
            className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/40 focus:border-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-dark/20 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={customer.email || ''}
            disabled
            className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary/60 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-primary/50">Email cannot be changed</p>
        </div>

        {editing && (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-accent-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-sand-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
