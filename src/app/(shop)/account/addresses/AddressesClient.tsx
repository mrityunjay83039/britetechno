'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, MapPin, Check, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

export interface Address {
  _id?: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface AddressesClientProps {
  initialAddresses: Address[];
}

export default function AddressesClient({ initialAddresses }: AddressesClientProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Status Toggles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setFullName('');
    setPhoneNumber('');
    setStreetAddress('');
    setCity('');
    setStateName('');
    setPincode('');
    setIsDefault(false);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const handleEditInit = (addr: Address) => {
    setFullName(addr.fullName);
    setPhoneNumber(addr.phoneNumber);
    setStreetAddress(addr.streetAddress);
    setCity(addr.city);
    setStateName(addr.state);
    setPincode(addr.pincode);
    setIsDefault(addr.isDefault);
    setEditingId(addr._id || null);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const addressData = {
      _id: editingId,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.trim(),
      isDefault,
    };

    try {
      const url = '/api/user/addresses';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Something went wrong.');
      }

      setAddresses(resData.addresses || []);
      setSuccess(editingId ? 'Address updated successfully!' : 'Address added successfully!');
      resetForm();
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to submit address.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/user/addresses?id=${addressId}`, {
        method: 'DELETE',
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to delete address.');
      }

      setAddresses(resData.addresses || []);
      setSuccess('Address deleted successfully!');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to delete address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Alert Banners */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-sans px-4 py-3 rounded-sm flex items-center gap-2.5">
          <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans px-4 py-3 rounded-sm flex items-center gap-2.5">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Addresses Listing (Only show if form is NOT active) */}
      {!showForm && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-sans text-lg font-semibold text-[#1E3A8A] tracking-wide">
              Saved Delivery Addresses
            </h3>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-[#1E3A8A] text-[#FFFFFF] border border-[#1E3A8A]/30 hover:bg-[#1E3A8A] hover:text-[#1E3A8A] font-sans text-[10px] font-bold tracking-widest px-4 py-2.5 uppercase transition-all duration-300 rounded-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="border border-dashed border-[#1E3A8A]/20 bg-[#FFFFFF]/30 rounded-sm p-12 text-center">
              <MapPin className="h-10 w-10 text-[#1E3A8A]/40 mx-auto mb-3" />
              <p className="font-sans text-xs text-[#64748B]">
                No delivery addresses saved yet. Save addresses for faster checkouts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`border p-5 rounded-sm relative flex flex-col justify-between transition-all duration-300 ${
                    addr.isDefault
                      ? 'border-[#1E3A8A] bg-[#FFFFFF]'
                      : 'border-[#1E3A8A]/15 bg-white hover:border-[#1E3A8A]/35'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="font-sans text-sm font-bold text-[#1E3A8A]">
                        {addr.fullName}
                      </span>
                      {addr.isDefault && (
                        <span className="bg-[#1E3A8A]/10 text-[#1E3A8A] border border-[#1E3A8A]/30 font-sans text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Default
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-xs text-[#64748B] leading-relaxed">
                      {addr.streetAddress}<br />
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>

                    <p className="font-sans text-xs text-[#64748B]">
                      <span className="font-semibold text-[#1E3A8A]">Phone:</span> {addr.phoneNumber}
                    </p>
                  </div>

                  <div className="flex justify-end gap-4 border-t border-[#1E3A8A]/10 pt-4 mt-5">
                    <button
                      onClick={() => handleEditInit(addr)}
                      className="text-[#64748B] hover:text-[#1E3A8A] font-sans text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => addr._id && handleDelete(addr._id)}
                      className="text-[#64748B] hover:text-red-500 font-sans text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inline Address Creation / Editing Form */}
      {showForm && (
        <div className="bg-[#FFFFFF]/50 border border-[#1E3A8A]/15 p-6 rounded-sm">
          <div className="flex justify-between items-center border-b border-[#1E3A8A]/10 pb-3 mb-5">
            <h3 className="font-sans text-lg font-semibold text-[#1E3A8A]">
              {editingId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>
            <button
              onClick={resetForm}
              className="p-1 text-[#64748B] hover:text-[#1E3A8A] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-1">
                <label className="block font-sans text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Receiver's name"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#1E3A8A]/25 text-[#1E3A8A] text-xs font-sans rounded-sm focus:border-[#1E3A8A] outline-none"
                />
              </div>

              {/* Phone Number */}
              <div className="sm:col-span-1">
                <label className="block font-sans text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#1E3A8A]/25 text-[#1E3A8A] text-xs font-sans rounded-sm focus:border-[#1E3A8A] outline-none"
                />
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block font-sans text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Flat, House no., Building, Company, Street, Area"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#1E3A8A]/25 text-[#1E3A8A] text-xs font-sans rounded-sm focus:border-[#1E3A8A] outline-none"
                />
              </div>

              {/* City */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Town/City"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#1E3A8A]/25 text-[#1E3A8A] text-xs font-sans rounded-sm focus:border-[#1E3A8A] outline-none"
                />
              </div>

              {/* State */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="State Name"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#1E3A8A]/25 text-[#1E3A8A] text-xs font-sans rounded-sm focus:border-[#1E3A8A] outline-none"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                  Pincode (ZIP)
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="6-digit pincode"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#1E3A8A]/25 text-[#1E3A8A] text-xs font-sans rounded-sm focus:border-[#1E3A8A] outline-none"
                />
              </div>

              {/* Default Address Checkbox */}
              <div className="sm:col-span-2 flex items-center gap-2.5 py-1.5">
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-[#1E3A8A]/30 text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
                />
                <label htmlFor="defaultAddressCheckbox" className="font-sans text-xs text-[#64748B] select-none cursor-pointer">
                  Set as default shipping address
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1E3A8A] text-[#FFFFFF] border border-[#1E3A8A]/30 hover:bg-[#1E3A8A] hover:text-[#1E3A8A] font-sans text-[10px] font-bold tracking-widest py-3 px-6 uppercase transition-all duration-300 flex items-center gap-2 rounded-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  editingId ? 'Update Address' : 'Add Address'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-[#1E3A8A]/20 hover:bg-black/5 text-[#64748B] font-sans text-[10px] font-bold tracking-widest py-3 px-6 uppercase transition-all duration-300 rounded-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
