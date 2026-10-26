import React from 'react';
import {
  MapPin,
  PlusCircle,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { toPersianDigits } from '../lib/utils';

interface MobileBottomNavProps {
  activeTab: 'explorer' | 'add-property' | 'packages' | 'requests';
  setActiveTab: (tab: 'explorer' | 'add-property' | 'packages' | 'requests') => void;
  requestsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  requestsCount,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around select-none">
      {/* 1. Explorer */}
      <button
        onClick={() => setActiveTab('explorer')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          activeTab === 'explorer'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            activeTab === 'explorer' ? 'bg-emerald-100/70 text-emerald-700' : ''
          }`}
        >
          <MapPin className="w-5 h-5" />
        </div>
        <span className="text-[11px] mt-0.5 whitespace-nowrap">کاوش املاک</span>
      </button>

      {/* 2. Add Property (Elevated Center Button) */}
      <button
        onClick={() => setActiveTab('add-property')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          activeTab === 'add-property'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            activeTab === 'add-property'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
        </div>
        <span className="text-[11px] mt-0.5 whitespace-nowrap">ثبت ملک</span>
      </button>

      {/* 3. Packages */}
      <button
        onClick={() => setActiveTab('packages')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          activeTab === 'packages'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            activeTab === 'packages' ? 'bg-emerald-100/70 text-emerald-700' : ''
          }`}
        >
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
        <span className="text-[11px] mt-0.5 whitespace-nowrap">پکیج‌ها</span>
      </button>

      {/* 4. Requests */}
      <button
        onClick={() => setActiveTab('requests')}
        className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          activeTab === 'requests'
            ? 'text-emerald-700 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all relative ${
            activeTab === 'requests' ? 'bg-emerald-100/70 text-emerald-700' : ''
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          {requestsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {toPersianDigits(requestsCount)}
            </span>
          )}
        </div>
        <span className="text-[11px] mt-0.5 whitespace-nowrap">پیگیری</span>
      </button>
    </nav>
  );
};
