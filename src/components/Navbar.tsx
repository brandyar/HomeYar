import React from 'react';
import {
  Building2,
  MapPin,
  Plus,
  Sparkles,
  ClipboardList,
  PhoneCall,
  Clock,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'explorer' | 'add-property' | 'packages' | 'requests';
  setActiveTab: (tab: 'explorer' | 'add-property' | 'packages' | 'requests') => void;
  propertiesCount: number;
  requestsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  propertiesCount,
  requestsCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* Top micro bar for customer service and helpline */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="text-slate-300 truncate">
              سامانه جامع فایلینگ و کارشناسی املاک استان گیلان (رشت و حومه)
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-slate-300">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>پاسخگویی: شنبه تا پنج‌شنبه ۹ الی ۲۱</span>
            </div>

            <span className="hidden sm:inline text-slate-700">|</span>

            <a
              href="tel:0133400"
              className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span>پشتیبانی: ۰۱۳-۳۴۰۰</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('explorer')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                هوم‌یـار
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold whitespace-nowrap">
                املاک گیلان
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 shrink-0">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'explorer'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="whitespace-nowrap">کاوش و نقشه املاک</span>
              {propertiesCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {propertiesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'packages'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="whitespace-nowrap">پکیج‌های خریدار</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="whitespace-nowrap">پیگیری درخواست‌ها</span>
              {requestsCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 font-bold">
                  {requestsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Action Button: Add Property */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('add-property')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'add-property'
                  ? 'bg-emerald-700 text-white shadow-emerald-700/30 ring-2 ring-emerald-600/40'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.02]'
              }`}
            >
              <Plus className="w-4 h-4 shrink-0 stroke-[3]" />
              <span className="whitespace-nowrap">ثبت رایگان ملک</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
