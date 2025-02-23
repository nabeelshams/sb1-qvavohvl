import React from 'react';
import { countries } from '../../utils/countries';

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
          className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
        >
          <option value="">Select a country</option>
          {countries.map((countryName) => (
            <option key={countryName} value={countryName}>
              {countryName}
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