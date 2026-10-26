import React from 'react';
import { PropertyRequest } from '../types/directus';
import {
  getStatusLabel,
  getPlanTierDetails,
  formatTomanReadable,
  toPersianDigits,
} from '../lib/utils';
import {
  ClipboardList,
  Phone,
  User,
  Calendar,
  Sparkles,
  RefreshCw,
  Plus,
  Clock,
  DollarSign,
} from 'lucide-react';

interface RequestsListProps {
  requests: PropertyRequest[];
  onRefresh: () => void;
  isLoading: boolean;
  onOpenNewRequest: () => void;
}

export const RequestsList: React.FC<RequestsListProps> = ({
  requests,
  onRefresh,
  isLoading,
  onOpenNewRequest,
}) => {
  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 px-4" dir="rtl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              درخواست‌های خرید و پکیج‌ها
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {toPersianDigits(requests.length)} مورد
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            سوابق درخواست‌های خرید، فروش و پکیج‌های ثبت‌شده در پایگاه داده
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="بروزرسانی داده‌ها"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>بروزرسانی</span>
          </button>

          <button
            onClick={onOpenNewRequest}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت درخواست جدید</span>
          </button>
        </div>
      </div>

      {/* Requests Cards List */}
      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">هنوز درخواستی ثبت نشده است</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            از بخش پکیج‌های خریداران می‌توانید پکیج مورد نظر خود را انتخاب و ثبت نمایید.
          </p>
          <button
            onClick={onOpenNewRequest}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
          >
            مشاهده و ثبت پکیج‌ها
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {requests.map((req) => {
            const statusInfo = getStatusLabel(req.status);
            const planInfo = getPlanTierDetails(req.plan_tier);

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  {/* Top tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusInfo.colorClass}`}
                    >
                      {statusInfo.text}
                    </span>

                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      پکیج: {planInfo.name}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      کد #{toPersianDigits(req.id)}
                    </span>
                  </div>

                  {/* Customer info */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {req.full_name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span className="font-mono font-medium">{toPersianDigits(req.phone)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget & notes */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-600 pt-1">
                    {req.budget && (
                      <div className="flex items-center gap-1 font-semibold text-emerald-800">
                        <span>بودجه اعلامی:</span>
                        <span>{formatTomanReadable(req.budget)}</span>
                      </div>
                    )}
                    {req.notes && (
                      <p className="text-slate-500 line-clamp-1 italic bg-slate-50 px-2 py-1 rounded-md">
                        «{req.notes}»
                      </p>
                    )}
                  </div>
                </div>

                {/* Date and contact action */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {req.date_created
                        ? new Date(req.date_created).toLocaleDateString('fa-IR')
                        : 'امروز'}
                    </span>
                  </div>

                  <a
                    href={`tel:${req.phone}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>تماس با متقاضی</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
