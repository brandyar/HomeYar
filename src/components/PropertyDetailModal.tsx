import React, { useState } from 'react';
import { Property, District } from '../types/directus';
import {
  formatTomanReadable,
  formatNumberWithCommas,
  toPersianDigits,
  getTransactionTypeLabel,
  getTransactionTypeColor,
  getPropertyTypeLabel,
  getDocumentTypeLabel,
} from '../lib/utils';
import { getAssetUrl } from '../lib/directus';
import {
  X,
  MapPin,
  Bed,
  Layers,
  FileCheck2,
  Phone,
  User,
  Calendar,
  Share2,
  Check,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property | null;
  districts: District[];
  onClose: () => void;
  onFocusMap: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  districts,
  onClose,
  onFocusMap,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  if (!property) return null;

  // Resolve gallery images
  const images: string[] = [];
  if (property.featured_image) {
    images.push(getAssetUrl(property.featured_image));
  }
  if (Array.isArray(property.gallery)) {
    property.gallery.forEach((g) => {
      if (typeof g === 'string') {
        images.push(getAssetUrl(g));
      } else if (g && (g as any).directus_files_id) {
        images.push(getAssetUrl((g as any).directus_files_id));
      }
    });
  }
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');
  }

  // Find district name
  const districtName = (() => {
    if (typeof property.district_id === 'object' && property.district_id !== null) {
      return (property.district_id as District).name;
    }
    const found = districts.find((d) => d.id === property.district_id);
    return found ? found.name : 'رشت';
  })();

  const transColors = getTransactionTypeColor(property.transaction_type);

  // Price per square meter calculation
  const pricePerMeter =
    property.price && property.area && property.transaction_type === 'sale'
      ? Math.round(property.price / property.area)
      : null;

  const handleCopyPhone = () => {
    if (property.owner_phone) {
      navigator.clipboard.writeText(property.owner_phone);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${transColors.bg} ${transColors.text} border ${transColors.border}`}
            >
              {getTransactionTypeLabel(property.transaction_type)}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {getPropertyTypeLabel(property.property_type)}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800">
              کد ملک: #{toPersianDigits(property.id)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onFocusMap(property);
                onClose();
              }}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>مشاهده روی نقشه</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Gallery Slider */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
              <img
                src={images[activeImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-medium">
                تصویر {toPersianDigits(activeImageIndex + 1)} از {toPersianDigits(images.length)}
              </div>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-emerald-600 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Location Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-2">
              {property.title}
            </h2>
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">{districtName}</span>
              {property.address_detail && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>{property.address_detail}</span>
                </>
              )}
            </div>
          </div>

          {/* Price Highlights Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/40 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="block text-xs font-semibold text-emerald-800 mb-1">
                {property.transaction_type === 'rent' ? 'ودیعه و رهن' : 'قیمت کل اعلامی مالک'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {formatTomanReadable(property.price)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                معادل {formatNumberWithCommas(property.price)} تومان
              </div>
            </div>

            {property.transaction_type === 'rent' && property.rent_price && (
              <div className="sm:border-r sm:border-emerald-200/60 sm:pr-6">
                <span className="block text-xs font-semibold text-emerald-800 mb-1">اجاره ماهانه</span>
                <div className="text-xl sm:text-2xl font-black text-slate-800">
                  {formatTomanReadable(property.rent_price)}
                </div>
              </div>
            )}

            {pricePerMeter && (
              <div className="sm:border-r sm:border-emerald-200/60 sm:pr-6">
                <span className="block text-xs font-semibold text-slate-600 mb-1">قیمت هر متر مربع</span>
                <div className="text-lg font-black text-slate-800">
                  {formatTomanReadable(pricePerMeter)}
                </div>
              </div>
            )}
          </div>

          {/* Key Technical Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-xs text-slate-500 mb-1">متراژ مفید</span>
              <span className="text-base font-bold text-slate-900">
                {toPersianDigits(property.area)} متر مربع
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-xs text-slate-500 mb-1">تعداد اتاق خواب</span>
              <span className="text-base font-bold text-slate-900">
                {property.rooms ? `${toPersianDigits(property.rooms)} خواب` : 'بدون خواب'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-xs text-slate-500 mb-1">طبقه و تعداد واحد</span>
              <span className="text-base font-bold text-slate-900">
                {property.floor ? `طبقه ${toPersianDigits(property.floor)}` : 'همکف'}
                {property.total_floors ? ` (از ${toPersianDigits(property.total_floors)} طبقه)` : ''}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="block text-xs text-slate-500 mb-1">نوع وضعیت سند</span>
              <span className="text-base font-bold text-slate-900">
                {getDocumentTypeLabel(property.document_type)}
              </span>
            </div>
          </div>

          {/* Amenities Checklist */}
          <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-3">امکانات اصلی ملک</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-xs">
                {property.has_elevator ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-300" />
                )}
                <span className={property.has_elevator ? 'font-bold text-slate-800' : 'text-slate-400'}>
                  آسانسور اختصاصی / عمومی
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {property.has_parking ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-300" />
                )}
                <span className={property.has_parking ? 'font-bold text-slate-800' : 'text-slate-400'}>
                  پارکینگ سندی اختصاصی
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {property.has_storage ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-300" />
                )}
                <span className={property.has_storage ? 'font-bold text-slate-800' : 'text-slate-400'}>
                  انباری سندی
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">توضیحات و مشخصات تکمیلی</h4>
              <div
                className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: property.description }}
              />
            </div>
          )}

          {/* Owner / Broker Contact Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">مشاور یا مالک فایل</span>
                <span className="text-base font-bold">{property.owner_name || 'کارشناس املاک هوم‌یار'}</span>
                <div className="text-xs text-emerald-400 font-mono mt-0.5">
                  {property.owner_phone ? toPersianDigits(property.owner_phone) : '۰۱۳-۳۴۰۰۰۰'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyPhone}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-700"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{isCopied ? 'کپی شد' : 'کپی شماره'}</span>
              </button>

              <a
                href={`tel:${property.owner_phone || '0133400'}`}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>تماس مستقیم</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
