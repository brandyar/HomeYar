/**
 * Formatting and Helper Utilities for Persian Real Estate
 */

export function toPersianDigits(n: number | string | null | undefined): string {
  if (n === null || n === undefined) return '';
  const str = n.toString();
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

export function formatNumberWithCommas(num: number | null | undefined): string {
  if (num === null || num === undefined) return '۰';
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return toPersianDigits(parts.join('.'));
}

/**
 * Formats Toman amounts into concise readable Persian (e.g. 3 میلیارد و 200 میلیون تومان)
 */
export function formatTomanReadable(amount: number | null | undefined): string {
  if (!amount || amount === 0) return 'توافقی';
  
  if (amount >= 1_000_000_000) {
    const billions = Math.floor(amount / 1_000_000_000);
    const millions = Math.floor((amount % 1_000_000_000) / 1_000_000);
    
    if (millions === 0) {
      return `${toPersianDigits(billions)} میلیارد تومان`;
    }
    return `${toPersianDigits(billions)} میلیارد و ${toPersianDigits(millions)} میلیون تومان`;
  }
  
  if (amount >= 1_000_000) {
    const millions = Math.floor(amount / 1_000_000);
    const thousands = Math.floor((amount % 1_000_000) / 1_000);
    
    if (thousands === 0) {
      return `${toPersianDigits(millions)} میلیون تومان`;
    }
    return `${toPersianDigits(millions)} میلیون و ${toPersianDigits(thousands)} هزار تومان`;
  }
  
  return `${formatNumberWithCommas(amount)} تومان`;
}

export function getTransactionTypeLabel(type: string): string {
  switch (type) {
    case 'sale':
      return 'فروش';
    case 'rent':
      return 'رهن و اجاره';
    case 'mortgage':
      return 'رهن کامل';
    default:
      return type;
  }
}

export function getTransactionTypeColor(type: string): { bg: string; text: string; border: string } {
  switch (type) {
    case 'sale':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'rent':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'mortgage':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

export function getPropertyTypeLabel(type: string): string {
  switch (type) {
    case 'apartment':
      return 'آپارتمان';
    case 'villa':
      return 'ویلایی';
    case 'land':
      return 'زمین / کلنگی';
    case 'commercial':
      return 'تجاری / اداری';
    default:
      return type;
  }
}

export function getDocumentTypeLabel(type?: string | null): string {
  switch (type) {
    case 'single_leaf':
      return 'سند تک‌برگ';
    case 'booklet':
      return 'سند منگوله‌دار';
    case 'contract':
      return 'قولنامه‌ای / نسق';
    case 'in_progress':
      return 'در دست اقدام';
    default:
      return 'نامشخص';
  }
}

export function getStatusLabel(status: string): { text: string; colorClass: string } {
  switch (status) {
    case 'published':
      return { text: 'منتشر شده', colorClass: 'bg-emerald-100 text-emerald-800' };
    case 'draft':
      return { text: 'در انتظار بررسی', colorClass: 'bg-amber-100 text-amber-800' };
    case 'sold':
      return { text: 'فروخته شده', colorClass: 'bg-slate-100 text-slate-800' };
    case 'archived':
      return { text: 'بایگانی شده', colorClass: 'bg-rose-100 text-rose-800' };
    case 'new':
      return { text: 'جدید', colorClass: 'bg-blue-100 text-blue-800' };
    case 'in_progress':
      return { text: 'در حال پیگیری کارشناس', colorClass: 'bg-amber-100 text-amber-800' };
    case 'completed':
      return { text: 'تکمیل شده', colorClass: 'bg-emerald-100 text-emerald-800' };
    case 'cancelled':
      return { text: 'لغو شده', colorClass: 'bg-rose-100 text-rose-800' };
    default:
      return { text: status, colorClass: 'bg-slate-100 text-slate-700' };
  }
}

export function getPlanTierDetails(tier?: string | null): { name: string; price: string; badge: string; color: string } {
  switch (tier) {
    case 'vip':
      return {
        name: 'VIP خریدار',
        price: '۳,۰۰۰,۰۰۰ تومان',
        badge: 'لوکس‌ترین خدمات',
        color: 'from-amber-500 to-yellow-600',
      };
    case 'special':
      return {
        name: 'تخصصی',
        price: '۱,۵۰۰,۰۰۰ تومان',
        badge: 'پرفروش‌ترین',
        color: 'from-emerald-600 to-teal-700',
      };
    case 'free':
    default:
      return {
        name: 'معمولی',
        price: 'رایگان',
        badge: 'شروع سریع',
        color: 'from-slate-600 to-slate-800',
      };
  }
}
