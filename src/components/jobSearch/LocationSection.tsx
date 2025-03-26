import React from 'react';
import { allowedCountries } from '../../utils/allowedCountries';

interface LocationSectionProps {
  country: string;
  city: string;
  onCountryChange: (value: string) => void;
  onCityChange: (value: string) => void;
}

export function LocationSection({
  country,
  city,
  onCountryChange,
  onCityChange
}: LocationSectionProps) {
  return (
    <>
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4">
          Country <span className="text-red-400">*</span>
        </h3>
        <select
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none text-white"
        >
          <option value="" className="bg-gray-900">Select a country</option>
          {allowedCountries.map(({ name }) => (
            <option key={name} value={name} className="bg-gray-900">
              {name}
            </option>
          ))}
        </select>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4">
          City <span className="text-red-400">*</span>
        </h3>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
        />
      </section>
    </>
  );
}