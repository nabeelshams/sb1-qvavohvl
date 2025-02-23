import React from 'react';

interface PersonalInfoProps {
  fullName: string;
  phoneNumber: string;
  email: string;
  website: string;
  address: string;
  onUpdate: (field: string, value: string) => void;
}

export function PersonalInfo({ fullName, phoneNumber, email, website, address, onUpdate }: PersonalInfoProps) {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => onUpdate('full_name', e.target.value)}
          className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => onUpdate('phone_number', e.target.value)}
          className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => onUpdate('email', e.target.value)}
          className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
        />
        <input
          type="text"
          placeholder="Website/Portfolio"
          value={website}
          onChange={(e) => onUpdate('website_or_portfolio', e.target.value)}
          className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
        />
      </div>
      <textarea
        placeholder="Address"
        value={address}
        onChange={(e) => onUpdate('address', e.target.value)}
        className="w-full mt-4 bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
        rows={2}
      />
    </section>
  );
}