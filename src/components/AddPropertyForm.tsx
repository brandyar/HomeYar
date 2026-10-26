import React, { useState } from 'react';
import {
  District,
  Property,
  TransactionType,
  PropertyType,
  DocumentType,
} from '../types/directus';
import { createProperty } from '../lib/directus';
import { PropertyMap } from './PropertyMap';
import {
  Building2,
  Check,
  MapPin,
  Sparkles,
  Image as ImageIcon,
  DollarSign,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { formatNumberWithCommas, toPersianDigits, formatTomanReadable } from '../lib/utils';

interface AddPropertyFormProps {
  districts: District[];
  onSuccess: (newProperty: Property) => void;
  onCancel: () => void;
}

const SAMPLE_IMAGES = [
  {
    label: 'آپارتمان مدرن',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'پنت‌هاوس لوکس',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'ویلای مدرن',
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'واحد اداری تجاری',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'فضای دنج و مینیمال',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  },
];

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({
  districts,
  onSuccess,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    transaction_type: TransactionType;
    property_type: PropertyType;
    district_id: number;
    area: string;
    rooms: string;
    floor: string;
    total_floors: string;
    price: string;
    rent_price: string;
    document_type: DocumentType;
    has_elevator: boolean;
    has_parking: boolean;
    has_storage: boolean;
    address_detail: string;
    latitude: number;
    longitude: number;
    featured_image: string;
    description: string;
    owner_name: string;
    owner_phone: string;
  }>({
    title: '',
    transaction_type: 'sale',
    property_type: 'apartment',
    district_id: districts[0]?.id || 1,
    area: '',
    rooms: '2',
    floor: '2',
    total_floors: '5',
    price: '',
    rent_price: '',
    document_type: 'single_leaf',
    has_elevator: true,
    has_parking: true,
    has_storage: true,
    address_detail: '',
    latitude: 37.2809,
    longitude: 49.5832,
    featured_image: SAMPLE_IMAGES[0].url,
    description: '',
    owner_name: '',
    owner_phone: '',
  });

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setSubmitError('لطفاً عنوان آگهی را وارد کنید.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.area || Number(formData.area) <= 0) {
        setSubmitError('لطفاً متراژ صحیح را مشخص نمایید.');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.price && formData.transaction_type !== 'rent') {
        setSubmitError('لطفاً قیمت کل ملک را مشخص نمایید.');
        return;
      }
    }
    setSubmitError(null);
    setCurrentStep((prev) => (prev < 4 ? ((prev + 1) as any) : prev));
  };

  const handlePrev = () => {
    setSubmitError(null);
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.owner_phone.trim()) {
      setSubmitError('لطفاً شماره تماس معتبر وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: Partial<Property> = {
        title: formData.title.trim(),
        transaction_type: formData.transaction_type,
        property_type: formData.property_type,
        district_id: Number(formData.district_id),
        area: Number(formData.area),
        rooms: formData.rooms ? Number(formData.rooms) : 0,
        floor: formData.floor ? Number(formData.floor) : 1,
        total_floors: formData.total_floors ? Number(formData.total_floors) : 1,
        price: formData.price ? Number(formData.price) : null,
        rent_price: formData.rent_price ? Number(formData.rent_price) : null,
        document_type: formData.document_type,
        has_elevator: formData.has_elevator,
        has_parking: formData.has_parking,
        has_storage: formData.has_storage,
        address_detail: formData.address_detail.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        featured_image: formData.featured_image,
        gallery: [formData.featured_image],
        description: formData.description.trim(),
        owner_name: formData.owner_name.trim() || 'مالک محترم',
        owner_phone: formData.owner_phone.trim(),
        status: 'published',
      };

      const result = await createProperty(payload);
      onSuccess(result.property);
    } catch (err: any) {
      setSubmitError('خطا در ثبت آگهی در سرور مرکزی.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4" dir="rtl">
      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-700/50 mb-2 inline-block">
                ثبت مستقیم در پایگاه داده املاک
              </span>
              <h2 className="text-xl sm:text-2xl font-black">ثبت رایگان فایل ملکی جدید</h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
                اطلاعات ملک خود را وارد کنید تا بلافاصله بر روی نقشه و لیست کاوش منتشر گردد.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              انصراف
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-emerald-700/50">
            {[
              { step: 1, title: 'اطلاعات پایه' },
              { step: 2, title: 'مشخصات فنی' },
              { step: 3, title: 'قیمت و نقشه' },
              { step: 4, title: 'تصاویر و تماس' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col gap-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    currentStep >= s.step ? 'bg-emerald-400' : 'bg-emerald-950/60'
                  }`}
                />
                <span
                  className={`text-[11px] font-semibold text-center truncate ${
                    currentStep === s.step ? 'text-white' : 'text-emerald-300/60'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {submitError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{submitError}</span>
            </div>
          )}

          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                مرحله ۱: نوع معامله و دسته‌بندی ملک
              </h3>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  عنوان جذاب آگهی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: آپارتمان ۱۲۰ متری تک‌واحدی در گلسار خیابان ۱۰۴"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>

              {/* Transaction Type */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'sale', label: 'فروش' },
                  { id: 'rent', label: 'رهن و اجاره' },
                  { id: 'mortgage', label: 'رهن کامل' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, transaction_type: t.id as TransactionType })
                    }
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                      formData.transaction_type === t.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Property Type & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع کاربری ملک</label>
                  <select
                    value={formData.property_type}
                    onChange={(e) =>
                      setFormData({ ...formData, property_type: e.target.value as PropertyType })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="apartment">آپارتمان مسکونی</option>
                    <option value="villa">خانه ویلایی</option>
                    <option value="land">زمین / کلنگی</option>
                    <option value="commercial">تجاری / اداری</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    محله در شهر رشت
                  </label>
                  <select
                    value={formData.district_id}
                    onChange={(e) =>
                      setFormData({ ...formData, district_id: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع سند</label>
                <select
                  value={formData.document_type}
                  onChange={(e) =>
                    setFormData({ ...formData, document_type: e.target.value as DocumentType })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="single_leaf">سند تک‌برگ رسمی</option>
                  <option value="booklet">سند منگوله‌دار</option>
                  <option value="contract">قولنامه‌ای معتبر / نسق با بنچاق</option>
                  <option value="in_progress">در دست اقدام</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Technical Specifications & Amenities */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                مرحله ۲: متراژ، طبقات و امکانات
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    متراژ (متر) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="مثلا ۱۱۰"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تعداد اتاق خواب</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طبقه واحد</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تعداد کل طبقات</label>
                  <input
                    type="number"
                    value={formData.total_floors}
                    onChange={(e) => setFormData({ ...formData, total_floors: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">امکانات اصلی ملک</label>
                <div className="grid grid-cols-3 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.has_elevator
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.has_elevator}
                      onChange={(e) =>
                        setFormData({ ...formData, has_elevator: e.target.checked })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs sm:text-sm">آسانسور دارد</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.has_parking
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.has_parking}
                      onChange={(e) =>
                        setFormData({ ...formData, has_parking: e.target.checked })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs sm:text-sm">پارکینگ دارد</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.has_storage
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.has_storage}
                      onChange={(e) =>
                        setFormData({ ...formData, has_storage: e.target.checked })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs sm:text-sm">انباری دارد</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Pricing & Interactive Location Picker on Map */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                مرحله ۳: قیمت‌گذاری و تعیین موقعیت روی نقشه
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {formData.transaction_type === 'rent'
                      ? 'مبلغ ودیعه (تومان)'
                      : 'قیمت کل (تومان)'}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="10000000"
                    placeholder="مثلا ۴۵۰۰۰۰۰۰۰۰"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                  />
                  {formData.price && (
                    <span className="text-xs text-emerald-700 font-bold block mt-1">
                      {formatTomanReadable(Number(formData.price))}
                    </span>
                  )}
                </div>

                {formData.transaction_type === 'rent' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اجاره ماهانه (تومان)
                    </label>
                    <input
                      type="number"
                      step="500000"
                      placeholder="مثلا ۱۵۰۰۰۰۰۰"
                      value={formData.rent_price}
                      onChange={(e) => setFormData({ ...formData, rent_price: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                    />
                    {formData.rent_price && (
                      <span className="text-xs text-emerald-700 font-bold block mt-1">
                        {formatTomanReadable(Number(formData.rent_price))} ماهانه
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Address detail */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  آدرس حدودی (جهت نمایش به خریدار)
                </label>
                <input
                  type="text"
                  placeholder="مثلا: گلسار، خیابان ۱۰۸، نزدیک میدان صابرین"
                  value={formData.address_detail}
                  onChange={(e) => setFormData({ ...formData, address_detail: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Map Pin Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>موقعیت مکانی روی نقشه شهر رشت (کلیک کنید)</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    مختصات: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                  </span>
                </label>
                <PropertyMap
                  properties={[]}
                  selectedPropertyId={null}
                  onSelectProperty={() => {}}
                  onOpenDetails={() => {}}
                  pickMode={true}
                  pickedPosition={{ lat: formData.latitude, lng: formData.longitude }}
                  onPickPosition={(lat, lng) =>
                    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                  }
                  heightClass="h-64 sm:h-72"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Images & Contact Information */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                مرحله ۴: تصویر شاخص و اطلاعات تماس مالک
              </h3>

              {/* Sample Images Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  انتخاب تصویر از نمونه‌های باکیفیت معماری
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {SAMPLE_IMAGES.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setFormData({ ...formData, featured_image: img.url })}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        formData.featured_image === img.url
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] text-center py-0.5 font-medium truncate px-1">
                        {img.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Image URL input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  یا لینک تصویر اختصاصی (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/property.jpg"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  توضیحات و مزایای فایل
                </label>
                <textarea
                  rows={3}
                  placeholder="مثال: نورگیر عالی، مشاعات شیک، طراحی مهندسی، کابینت‌های مدرن و دسترسی سریع به بلوار اصلی..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              {/* Owner Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام مالک یا مشاور
                  </label>
                  <input
                    type="text"
                    placeholder="مثلا: مهندس احمدی"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شماره تماس مالک <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="۰۹۱۱۳۳۱۰۰۰۰"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>مرحله قبل</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <span>مرحله بعد</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>در حال ثبت در سرور مرکزی...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>انتشار و ثبت نهایی ملک</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
