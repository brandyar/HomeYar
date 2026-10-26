import React from 'react';
import { District, TransactionType, PropertyType } from '../types/directus';
import {
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Home,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  transactionType: string; // 'all' | 'sale' | 'rent' | 'mortgage'
  propertyType: string; // 'all' | 'apartment' | 'villa' | 'land' | 'commercial'
  districtId: string; // 'all' | district id
  minArea: string;
  maxArea: string;
  minPrice: string;
  maxPrice: string;
  hasElevator: boolean;
  hasParking: boolean;
  hasStorage: boolean;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'area-desc';
}

interface PropertyFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  districts: District[];
  totalResults: number;
  onReset: () => void;
  viewMode: 'split' | 'grid' | 'map';
  setViewMode: (mode: 'split' | 'grid' | 'map') => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  setFilters,
  districts,
  totalResults,
  onReset,
  viewMode,
  setViewMode,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);

  const handleTransactionChange = (type: string) => {
    setFilters((prev) => ({ ...prev, transactionType: type }));
  };

  const handlePropertyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, propertyType: e.target.value }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, districtId: e.target.value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 mb-4">
      {/* Top Search & Primary Filter Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="جستجو بر اساس عنوان، خیابان یا مشخصات (مثلا: گلسار، تک‌واحدی، پنت‌هاوس)..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm bg-slate-50/50 outline-none transition-all placeholder:text-slate-400"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              پاک کردن
            </button>
          )}
        </div>

        {/* Transaction Type Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto overflow-x-auto w-full lg:w-auto">
          {[
            { id: 'all', label: 'همه معاملات' },
            { id: 'sale', label: 'فروش' },
            { id: 'rent', label: 'رهن و اجاره' },
            { id: 'mortgage', label: 'رهن کامل' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTransactionChange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filters.transactionType === item.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* View Mode Switcher (Desktop) */}
        <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 pr-3 mr-1">
          <button
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="نمای دوتایی نقشه و لیست"
          >
            دوطرفه
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="فقط شبکه‌ای"
          >
            لیست
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-emerald-100 text-emerald-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="تمام صفحه نقشه"
          >
            نقشه
          </button>
        </div>
      </div>

      {/* Second Row: Dropdowns (District, Property Type, Sort) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-100">
        {/* District selection */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">محله / منطقه</label>
          <select
            value={filters.districtId}
            onChange={handleDistrictChange}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="all">تمام محله‌های رشت</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id.toString()}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">نوع ملک</label>
          <select
            value={filters.propertyType}
            onChange={handlePropertyTypeChange}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="all">همه انواع ملک</option>
            <option value="apartment">آپارتمان</option>
            <option value="villa">ویلایی</option>
            <option value="land">زمین / کلنگی</option>
            <option value="commercial">تجاری / اداری</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">مرتب‌سازی</label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as FilterState['sortBy'],
              }))
            }
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="newest">جدیدترین آگهی‌ها</option>
            <option value="price-asc">ارزان‌ترین به گران‌ترین</option>
            <option value="price-desc">گران‌ترین به ارزان‌ترین</option>
            <option value="area-desc">بیشترین متراژ</option>
          </select>
        </div>

        {/* Toggle Advanced Filters Button */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isAdvancedOpen || filters.hasElevator || filters.hasParking || filters.hasStorage || filters.minArea || filters.maxPrice
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>فیلترهای پیشرفته</span>
            {isAdvancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Advanced Filters Drawer */}
      {isAdvancedOpen && (
        <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Area range */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">حداقل متراژ (متر)</label>
              <input
                type="number"
                value={filters.minArea}
                onChange={(e) => setFilters((prev) => ({ ...prev, minArea: e.target.value }))}
                placeholder="مثلا ۷۰"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">حداکثر متراژ (متر)</label>
              <input
                type="number"
                value={filters.maxArea}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxArea: e.target.value }))}
                placeholder="مثلا ۲۵۰"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Price range */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">حداکثر قیمت کل (تومان)</label>
              <input
                type="number"
                step="500000000"
                value={filters.maxPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                placeholder="مثلا ۱۵۰۰۰۰۰۰۰۰۰"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Amenities Checkboxes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">امکانات رفاهی</label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasElevator}
                    onChange={(e) => setFilters((prev) => ({ ...prev, hasElevator: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span>آسانسور</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasParking}
                    onChange={(e) => setFilters((prev) => ({ ...prev, hasParking: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span>پارکینگ</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasStorage}
                    onChange={(e) => setFilters((prev) => ({ ...prev, hasStorage: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span>انباری</span>
                </label>
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-3 py-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاک‌سازی تمام فیلترها</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
