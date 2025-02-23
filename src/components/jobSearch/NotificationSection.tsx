import React from 'react';
import { phoneCountryCodes } from '../../utils/phoneCountryCodes';

interface NotificationSectionProps {
  email: string;
  whatsappNumber: string;
  countryCode: string;
  enableWhatsapp: boolean;
  onEmailChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  onWhatsappToggle: () => void;
}

export function NotificationSection({
  email,
  whatsappNumber,
  countryCode,
  enableWhatsapp,
  onEmailChange,
  onWhatsappChange,
  onCountryCodeChange,
  onWhatsappToggle
}: NotificationSectionProps) {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Notification Preferences</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={true}
              disabled={true}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-not-allowed opacity-50"
            />
            <span>Email Notifications <span className="text-red-400">*</span></span>
          </label>
          <div className="ml-7">
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full bg-black/20 p-2 rounded border border-white/10 focus:border-blue-500 outline-none text-sm"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={enableWhatsapp}
              onChange={onWhatsappToggle}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>WhatsApp Notifications</span>
          </label>
          {enableWhatsapp && (
            <div className="ml-7 flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => onCountryCodeChange(e.target.value)}
                className="bg-black/20 p-2 rounded border border-white/10 focus:border-blue-500 outline-none text-sm"
              >
                {phoneCountryCodes.map(({ code, country }) => (
                  <option key={code} value={code}>
                    {code} ({country})
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Enter WhatsApp number"
                value={whatsappNumber}
                onChange={(e) => onWhatsappChange(e.target.value)}
                className="flex-1 bg-black/20 p-2 rounded border border-white/10 focus:border-blue-500 outline-none text-sm"
                pattern="[0-9]*"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}