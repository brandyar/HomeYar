import React, { useState, useEffect, useMemo } from 'react';
import { Property, District, PropertyRequest } from './types/directus';
import {
  fetchProperties,
  fetchDistricts,
  fetchPropertyRequests,
} from './lib/directus';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PropertyMap } from './components/PropertyMap';
import { PropertyCard } from './components/PropertyCard';
import { PropertyFilters, FilterState } from './components/PropertyFilters';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { AddPropertyForm } from './components/AddPropertyForm';
import { PricingPackages } from './components/PricingPackages';
import { RequestsList } from './components/RequestsList';
import {
  toPersianDigits,
  formatTomanReadable,
} from './lib/utils';
import {
  Building2,
  CheckCircle2,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  transactionType: 'all',
  propertyType: 'all',
  districtId: 'all',
  minArea: '',
  maxArea: '',
  minPrice: '',
  maxPrice: '',
  hasElevator: false,
  hasParking: false,
  hasStorage: false,
  sortBy: 'newest',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'add-property' | 'packages' | 'requests'>('explorer');
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>('split');

  const [properties, setProperties] = useState<Property[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Load data directly from production environment
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [distList, propList, reqList] = await Promise.all([
        fetchDistricts(),
        fetchProperties(),
        fetchPropertyRequests(),
      ]);

      setDistricts(distList);
      setProperties(propList);
      setRequests(reqList);

      if (propList.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(propList[0].id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filtered and Sorted Properties
  const filteredProperties = useMemo(() => {
    return properties
      .filter((prop) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const titleMatch = prop.title?.toLowerCase().includes(q);
          const addressMatch = prop.address_detail?.toLowerCase().includes(q);
          const descMatch = prop.description?.toLowerCase().includes(q);
          if (!titleMatch && !addressMatch && !descMatch) return false;
        }

        // Transaction Type
        if (filters.transactionType !== 'all') {
          if (prop.transaction_type !== filters.transactionType) return false;
        }

        // Property Type
        if (filters.propertyType !== 'all') {
          if (prop.property_type !== filters.propertyType) return false;
        }

        // District
        if (filters.districtId !== 'all') {
          const dId = Number(filters.districtId);
          const propDistrictId =
            typeof prop.district_id === 'object' && prop.district_id !== null
              ? (prop.district_id as District).id
              : prop.district_id;
          if (propDistrictId !== dId) return false;
        }

        // Area range
        if (filters.minArea && prop.area < Number(filters.minArea)) return false;
        if (filters.maxArea && prop.area > Number(filters.maxArea)) return false;

        // Max price
        if (filters.maxPrice && prop.price && prop.price > Number(filters.maxPrice)) return false;

        // Amenities
        if (filters.hasElevator && !prop.has_elevator) return false;
        if (filters.hasParking && !prop.has_parking) return false;
        if (filters.hasStorage && !prop.has_storage) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') {
          return (a.price || 0) - (b.price || 0);
        }
        if (filters.sortBy === 'price-desc') {
          return (b.price || 0) - (a.price || 0);
        }
        if (filters.sortBy === 'area-desc') {
          return (b.area || 0) - (a.area || 0);
        }
        // Newest default
        return new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime();
      });
  }, [properties, filters]);

  // Selected property object
  const selectedProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Vazirmatn'] text-slate-800 pb-20 md:pb-0" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-[800] bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Production Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        propertiesCount={properties.length}
        requestsCount={requests.length}
      />

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col">
        {/* TAB 1: PROPERTY EXPLORER (MAP + GRID VIEW) */}
        {activeTab === 'explorer' && (
          <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-6 flex-1 flex flex-col">
            {/* Advanced Filters Bar */}
            <PropertyFilters
              filters={filters}
              setFilters={setFilters}
              districts={districts}
              totalResults={filteredProperties.length}
              onReset={() => setFilters(INITIAL_FILTERS)}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {/* Results Counter and View Mode Toggle Bar */}
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span>نمایش</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {toPersianDigits(filteredProperties.length)} ملک فعال
                </span>
                <span>در مناطق رشت و حومه</span>
              </div>

              {/* Mobile View Toggle */}
              <div className="flex sm:hidden items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-2 py-1 rounded text-[11px] font-bold ${
                    viewMode === 'split' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  دوطرفه
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1 rounded text-[11px] font-bold ${
                    viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  لیست
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-2 py-1 rounded text-[11px] font-bold ${
                    viewMode === 'map' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  نقشه
                </button>
              </div>
            </div>

            {/* SPLIT VIEW (List on right, Map on left) */}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
                {/* Right Side: Cards List */}
                <div className="lg:col-span-6 xl:col-span-7 space-y-4 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
                  {filteredProperties.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
                      <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-slate-700">هیچ ملکی با این مشخصات یافت نشد</h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4">
                        لطفاً فیلترها را تغییر داده یا پاک‌سازی نمایید.
                      </p>
                      <button
                        onClick={() => setFilters(INITIAL_FILTERS)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        پاک‌سازی فیلترها
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredProperties.map((prop) => (
                        <PropertyCard
                          key={prop.id}
                          property={prop}
                          districts={districts}
                          isSelected={prop.id === selectedPropertyId}
                          onSelect={(p) => setSelectedPropertyId(p.id)}
                          onOpenDetails={(p) => setDetailProperty(p)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Left Side: Sticky Interactive Leaflet Map */}
                <div className="lg:col-span-6 xl:col-span-5 sticky top-24 h-[420px] lg:h-[calc(100vh-230px)] rounded-2xl overflow-hidden shadow-sm">
                  <PropertyMap
                    properties={filteredProperties}
                    selectedPropertyId={selectedPropertyId}
                    onSelectProperty={(p) => setSelectedPropertyId(p.id)}
                    onOpenDetails={(p) => setDetailProperty(p)}
                    heightClass="h-full"
                  />
                </div>
              </div>
            )}

            {/* GRID ONLY VIEW */}
            {viewMode === 'grid' && (
              <div className="flex-1">
                {filteredProperties.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-700">ملکی با این مشخصات یافت نشد</h3>
                    <button
                      onClick={() => setFilters(INITIAL_FILTERS)}
                      className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                    >
                      پاک‌سازی فیلترها
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredProperties.map((prop) => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        districts={districts}
                        isSelected={prop.id === selectedPropertyId}
                        onSelect={(p) => setSelectedPropertyId(p.id)}
                        onOpenDetails={(p) => setDetailProperty(p)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MAP ONLY FULLSCREEN VIEW */}
            {viewMode === 'map' && (
              <div className="relative h-[calc(100vh-230px)] rounded-3xl overflow-hidden shadow-md border border-slate-200">
                <PropertyMap
                  properties={filteredProperties}
                  selectedPropertyId={selectedPropertyId}
                  onSelectProperty={(p) => setSelectedPropertyId(p.id)}
                  onOpenDetails={(p) => setDetailProperty(p)}
                  heightClass="h-full"
                />

                {/* Floating bottom preview drawer for selected property */}
                {selectedProperty && (
                  <div className="absolute bottom-4 inset-x-4 max-w-md mx-auto z-[400] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={selectedProperty.featured_image || ''}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {selectedProperty.title}
                        </h4>
                        <div className="text-emerald-700 font-black text-xs mt-0.5">
                          {formatTomanReadable(selectedProperty.price)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDetailProperty(selectedProperty)}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      مشاهده
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD PROPERTY FORM */}
        {activeTab === 'add-property' && (
          <AddPropertyForm
            districts={districts}
            onSuccess={(newProp) => {
              setProperties((prev) => [newProp, ...prev]);
              setSelectedPropertyId(newProp.id);
              setActiveTab('explorer');
              showToast('آگهی ملک شما با موفقیت ثبت و منتشر شد.');
            }}
            onCancel={() => setActiveTab('explorer')}
          />
        )}

        {/* TAB 3: PRICING PACKAGES */}
        {activeTab === 'packages' && (
          <PricingPackages
            onSuccess={(newReq) => {
              setRequests((prev) => [newReq, ...prev]);
              showToast('درخواست پکیج شما با موفقیت در سیستم ثبت گردید.');
            }}
            onViewRequests={() => setActiveTab('requests')}
          />
        )}

        {/* TAB 4: REQUESTS TRACKER */}
        {activeTab === 'requests' && (
          <RequestsList
            requests={requests}
            isLoading={isLoading}
            onRefresh={loadData}
            onOpenNewRequest={() => setActiveTab('packages')}
          />
        )}
      </main>

      {/* Property Details Modal */}
      <PropertyDetailModal
        property={detailProperty}
        districts={districts}
        onClose={() => setDetailProperty(null)}
        onFocusMap={(p) => {
          setSelectedPropertyId(p.id);
          setActiveTab('explorer');
        }}
      />

      {/* Sticky Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        requestsCount={requests.length}
      />

      {/* Production Footer (Desktop) */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 block text-sm">هوم‌یار املاک گیلان</span>
              <span className="text-slate-400 text-[11px]">
                پلتفرم تخصصی فایلینگ، کارشناسی و معاملات رسمی املاک
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-600 text-xs">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>دفتر مرکزی: رشت، بلوار گلسار، نبش خیابان ۹۸</span>
            </div>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-1.5 font-bold text-emerald-700">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>پشتیبانی: ۰۱۳-۳۴۰۰</span>
            </div>
          </div>

          <div className="text-slate-400 text-[11px]">
            تمامی حقوق مادی و معنوی محفوظ است © ۱۴۰۵
          </div>
        </div>
      </footer>
    </div>
  );
}
