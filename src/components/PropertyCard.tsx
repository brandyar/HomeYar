import React from 'react';
import { Property, District } from '../types/directus';
import {
  formatTomanReadable,
  toPersianDigits,
  getTransactionTypeLabel,
  getTransactionTypeColor,
  getPropertyTypeLabel,
  getDocumentTypeLabel,
} from '../lib/utils';
import { getAssetUrl } from '../lib/directus';
import {
  MapPin,
  Bed,
  Layers,
  Car,
  Warehouse,
  ChevronLeft,
  ArrowUpCircle,
  FileCheck2,
  Navigation,
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  districts: District[];
  isSelected: boolean;
  onSelect: (property: Property) => void;
  onOpenDetails: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  districts,
  isSelected,
  onSelect,
  onOpenDetails,
}) => {
  // Find district name
  const districtName = React.useMemo(() => {
    if (typeof property.district_id === 'object' && property.district_id !== null) {
      return (property.district_id as District).name;
    }
    const found = districts.find((d) => d.id === property.district_id);
    return found ? found.name : 'رشت';
  }, [property.district_id, districts]);

  const transColors = getTransactionTypeColor(property.transaction_type);
  const imageUrl = getAssetUrl(property.featured_image);

  return (
    <div
      onClick={() => onSelect(property)}
      className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-emerald-500 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500/30'
          : 'border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      {/* Top Media Section */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${transColors.bg} ${transColors.text} border ${transColors.border}`}
          >
            {getTransactionTypeLabel(property.transaction_type)}
          </span>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-black/50 text-white backdrop-blur-md">
            {getPropertyTypeLabel(property.property_type)}
          </span>
        </div>

        {/* District & Location bottom-right */}
        <div className="absolute bottom-3 right-3 text-white">
          <div className="flex items-center gap-1 font-bold text-sm drop-shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{districtName}</span>
          </div>
          {property.address_detail && (
            <p className="text-[11px] text-slate-200 line-clamp-1 drop-shadow-xs">
              {property.address_detail}
            </p>
          )}
        </div>

        {/* Area tag bottom-left */}
        <div className="absolute bottom-3 left-3 bg-white/95 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-md">
          {toPersianDigits(property.area)} متر
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors mb-2.5">
            {property.title}
          </h3>

          {/* Specs Chips */}
          <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 mb-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5" title="تعداد اتاق خواب">
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {property.rooms ? `${toPersianDigits(property.rooms)} خواب` : 'بدون خواب'}
              </span>
            </div>

            <div className="flex items-center gap-1.5" title="طبقه">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {property.floor
                  ? `طبقه ${toPersianDigits(property.floor)}${
                      property.total_floors ? ` از ${toPersianDigits(property.total_floors)}` : ''
                    }`
                  : 'همکف'}
              </span>
            </div>

            <div className="flex items-center gap-1.5" title="سند">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{getDocumentTypeLabel(property.document_type)}</span>
            </div>
          </div>

          {/* Key Amenities */}
          <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-500 flex-wrap">
            {property.has_elevator && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                <ArrowUpCircle className="w-3 h-3 text-emerald-600" />
                آسانسور
              </span>
            )}
            {property.has_parking && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                <Car className="w-3 h-3 text-emerald-600" />
                پارکینگ
              </span>
            )}
            {property.has_storage && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                <Warehouse className="w-3 h-3 text-emerald-600" />
                انباری
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="block text-[11px] text-slate-400 font-medium">
              {property.transaction_type === 'rent' ? 'ودیعه و اجاره' : 'قیمت کل'}
            </span>
            <div className="text-emerald-700 font-black text-sm sm:text-base leading-tight">
              {formatTomanReadable(property.price)}
            </div>
            {property.transaction_type === 'rent' && property.rent_price && (
              <div className="text-[11px] font-semibold text-slate-600">
                اجاره: {formatTomanReadable(property.rent_price)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(property);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              title="تمرکز روی نقشه"
            >
              <Navigation className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(property);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
            >
              <span>جزئیات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
