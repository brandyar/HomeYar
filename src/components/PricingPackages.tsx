import React, { useState } from 'react';
import { PlanTier, PropertyRequest } from '../types/directus';
import { createPropertyRequest } from '../lib/directus';
import {
  Check,
  Sparkles,
  ShieldCheck,
  Crown,
  Zap,
  PhoneCall,
  Clock,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toPersianDigits, formatTomanReadable } from '../lib/utils';

interface PricingPackagesProps {
  onSuccess: (newRequest: PropertyRequest) => void;
  onViewRequests: () => void;
}

interface PlanItem {
  id: PlanTier;
  name: string;
  badge?: string;
  priceText: string;
  priceNote: string;
  subtitle: string;
  isPopular?: boolean;
  accentColor: string;
  features: string[];
}

const PLANS: PlanItem[] = [
  {
    id: 'free',
    name: 'خریدار معمولی',
    priceText: 'رایگان',
    priceNote: 'بدون هیچ‌گونه هزینه اولیه',
    subtitle: 'مناسب برای جستجوگران مستقل که به دنبال بررسی عمومی فایل‌های بازار هستند.',
    accentColor: 'border-slate-200 text-slate-800',
    features: [
      'دسترسی کامل به تمام آگهی‌های عمومی شهر رشت',
      'مشاهده مشخصات فنی، متراژ و موقعیت تقریبی روی نقشه',
      'امکان فیلتر پیشرفته بر اساس محله، قیمت و امکانات',
      'تماس مستقیم با مالکین یا مشاورین آگهی',
      'پشتیبانی آنلاین درون برنامه‌ای',
    ],
  },
  {
    id: 'special',
    name: 'خریدار تخصصی',
    badge: 'پیشنهاد هوم‌یار / پرفروش‌ترین',
    priceText: '۱,۵۰۰,۰۰۰ تومان',
    priceNote: 'اعتبار ۳۰ روزه تا زمان خرید موفق',
    subtitle: 'همراهی مشاور متخصص منطقه برای یافتن فایلهای زیرقیمت و اکازیون.',
    isPopular: true,
    accentColor: 'border-emerald-500 text-emerald-800',
    features: [
      'اختصاص مشاور ملکی ارشد و پاسخگویی اختصاصی روزانه',
      'معرفی فایل‌های انحصاری قبل از انتشار در سامانه‌های عمومی',
      'تحلیل و کارشناسی واقعی قیمت منطقه بر اساس آخرین مبایعه‌نامه‌ها',
      'تنظیم وقت و همراهی مشاور در بازدید حضوری از املاک',
      'استعلام اولیه سلامت سند و عدم بازداشتی ملک',
      'اولویت معرفی در فایلهای فوری زیرقیمت بازار',
    ],
  },
  {
    id: 'vip',
    name: 'خریدار VIP و سرمایه‌گذار',
    badge: 'خدمات ویژه حقوقی و ملکی',
    priceText: '۳,۰۰۰,۰۰۰ تومان',
    priceNote: 'پکیج طلایی تا مرحله امضای سند رسمی',
    subtitle: 'کامل‌ترین سطح امنیت معامله، حضور وکیل پایه یک و کارشناس رسمی سازه.',
    accentColor: 'border-amber-500 text-amber-900',
    features: [
      'مدیر قرارداد اختصاصی + همراهی وکیل پایه یک دادگستری در اتاق عقد قرارداد',
      'استعلام کامل ثبتی، شهرداری، پایان‌کار و مفاصاحساب دارایی',
      'کارشناسی فنی سازه، تاسیسات و سلامت فونداسیون توسط مهندس ناظر',
      'تنظیم مبایعه‌نامه کاملاً حقوقی با بندهای بازدارنده ضرر و زیان',
      'اولویت ۱۰۰٪ در دسترسی به پروژه‌های پیش‌فروش معتبر و پرسود',
      'گزارش مکتوب و مستند ارزش‌گذاری کارشناسی ملک قبل از واریز وجه',
    ],
  },
];

export const PricingPackages: React.FC<PricingPackagesProps> = ({
  onSuccess,
  onViewRequests,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenModal = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setSubmitSuccess(false);
    setErrorMessage(null);
  };

  const handleCloseModal = () => {
    setSelectedPlan(null);
    setFullName('');
    setPhone('');
    setBudget('');
    setNotes('');
    setSubmitSuccess(false);
    setErrorMessage(null);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    if (!phone.trim()) {
      setErrorMessage('لطفاً شماره تماس را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: Partial<PropertyRequest> = {
        full_name: fullName.trim() || 'مشتری گرامی',
        phone: phone.trim(),
        budget: budget ? Number(budget) : null,
        plan_tier: selectedPlan.id,
        request_type: 'buyer',
        notes: notes.trim(),
        status: 'new',
      };

      const result = await createPropertyRequest(payload);
      setSubmitSuccess(true);
      onSuccess(result.request);
    } catch (err: any) {
      setErrorMessage('خطا در ثبت درخواست. لطفاً مجدداً تلاش نمایید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>خدمات هوشمند کارشناسی و همراهی خریدار</span>
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          پکیج‌های خرید مطمئن در بازار املاک رشت
        </h2>
        <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
          با انتخاب پکیج مناسب، کارشناسان ارشد حقوقی و ملکی هوم‌یار از اولین تماس تا تحویل کلید و
          تنظیم سند در کنار شما هستند.
        </p>
      </div>

      {/* 3 Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl bg-white border-2 flex flex-col justify-between transition-all duration-300 p-6 sm:p-8 shadow-sm hover:shadow-xl ${
              plan.isPopular
                ? 'border-emerald-600 ring-4 ring-emerald-500/10 shadow-emerald-600/10 scale-100 md:-translate-y-2'
                : 'border-slate-200/90'
            }`}
          >
            {/* Popular Ribbon */}
            {plan.isPopular && (
              <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                <span className="bg-emerald-600 text-white text-xs font-black px-4 py-1 rounded-full shadow-md">
                  {plan.badge}
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                {plan.id === 'vip' ? (
                  <Crown className="w-6 h-6 text-amber-500" />
                ) : plan.id === 'special' ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Zap className="w-6 h-6 text-slate-400" />
                )}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-6 min-h-[36px]">
                {plan.subtitle}
              </p>

              {/* Price section */}
              <div className="pb-6 mb-6 border-b border-slate-100">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {plan.priceText}
                </div>
                <div className="text-xs text-slate-400 mt-1">{plan.priceNote}</div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <span className="block text-xs font-bold text-slate-700">شامل امکانات:</span>
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-normal">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTA Button */}
            <div>
              <button
                type="button"
                onClick={() => handleOpenModal(plan)}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
                  plan.isPopular
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:scale-[1.02]'
                    : plan.id === 'vip'
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25 hover:scale-[1.02]'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {plan.id === 'free' ? 'ثبت درخواست جستجو رایگان' : `انتخاب پکیج ${plan.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black">
              ضمانت ۱۰۰٪ سلامت حقوقی و مالی معاملات
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              تمامی معاملات خریداران دارای پکیج، تحت نظارت مستقیم وکلای پایه یک دادگستری و استعلام
              رسمی ثبت اسناد و شهرداری منعقد می‌گردد.
            </p>
          </div>
        </div>

        <button
          onClick={onViewRequests}
          className="shrink-0 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-bold text-emerald-400 border border-slate-700 transition-colors cursor-pointer"
        >
          مشاهده وضعیت درخواست‌های ثبت‌شده
        </button>
      </div>

      {/* Request Submission Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              onClick={handleCloseModal}
              className="absolute left-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitSuccess ? (
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-emerald-600 block mb-1">
                    ثبت در سامانه هوشمند متقاضیان ملک
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    درخواست فعال‌سازی {selectedPlan.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    هزینه پکیج: <span className="font-bold text-slate-800">{selectedPlan.priceText}</span>
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلا: کامران پورمحمدی"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شماره تماس همراه <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    بودجه تقریبی خرید (تومان)
                  </label>
                  <input
                    type="number"
                    step="500000000"
                    placeholder="مثلا ۶۵۰۰۰۰۰۰۰۰"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none"
                  />
                  {budget && (
                    <span className="text-xs text-emerald-700 font-bold block mt-1">
                      {formatTomanReadable(Number(budget))}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نیازها و اولویت‌های شما (محله، متراژ، خواب و...)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="مثلا: به دنبال واحد ۳ خوابه در گلسار یا بلوار گیلان با دو پارکینگ هستم..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none resize-none"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>در حال ثبت درخواست...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>ارسال و شروع پیگیری کارشناس</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  درخواست شما با موفقیت ثبت شد!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                  اطلاعات شما در سرور مرکزی ثبت گردید. کارشناس ارشد منطقه به زودی با
                  شماره <span className="font-bold text-emerald-700 font-mono">{phone}</span> تماس
                  خواهد گرفت.
                </p>
                <div className="pt-3 flex gap-2 justify-center">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    بستن
                  </button>
                  <button
                    onClick={() => {
                      handleCloseModal();
                      onViewRequests();
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    مشاهده در لیست درخواست‌ها
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
