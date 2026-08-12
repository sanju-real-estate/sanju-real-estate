import React, { useState } from 'react';
import { Property } from '../types';
import { useApp } from '../context/AppContext';
import { X, Phone, Calendar, Mail, User, ShieldCheck, Check } from 'lucide-react';

interface LeadModalProps {
  property: Property | null;
  onClose: () => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({ property, onClose }) => {
  const { addInquiry } = useApp();

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userType, setUserType] = useState<'Buyer' | 'Tenant' | 'Investor' | 'Agent'>('Buyer');
  const [message, setMessage] = useState('I am interested in this property. Please share full details and schedule a site visit.');
  const [scheduleVisitDate, setScheduleVisitDate] = useState('');

  if (!property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addInquiry({
      propertyId: property.id,
      propertyTitle: property.title,
      userName,
      userEmail,
      userPhone,
      userType,
      message,
      scheduleVisitDate
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-gray-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="bg-red-100 text-red-700 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded">
            BROKER HELPLINE: +91 97721 17575
          </span>
          <h2 className="text-xl font-extrabold text-gray-900 mt-1 leading-snug">
            Inquire About {property.title}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {property.locality}, {property.city} • <strong className="text-red-600">{property.priceDisplay}</strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* User Role Pills */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              I am a:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Buyer', 'Tenant', 'Investor'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setUserType(role)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    userType === role
                      ? 'bg-red-600 border-red-600 text-white shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Phone */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Your Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-base sm:text-xs font-medium text-gray-900 focus:bg-white focus:border-red-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Mobile Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                required
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="+91 98112 33445"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-base sm:text-xs font-medium text-gray-900 focus:bg-white focus:border-red-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-base sm:text-xs font-medium text-gray-900 focus:bg-white focus:border-red-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* Schedule Date */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Preferred Site Visit Date (Optional)
            </label>
            <input
              type="date"
              value={scheduleVisitDate}
              onChange={(e) => setScheduleVisitDate(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900"
            />
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Message / Specific Requirements
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Phone className="w-4 h-4" />
            <span>Submit Lead & Get Direct Callback</span>
          </button>

          <p className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Zero Spam Guarantee. All inquiries are handled directly via broker line (+91 97721 17575).
          </p>
        </form>

      </div>
    </div>
  );
};
