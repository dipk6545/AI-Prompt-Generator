import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ReportItem {
  change: string;
  reason: string;
}

interface OptimizationReportCardProps {
  report: ReportItem[];
}

export const OptimizationReportCard: React.FC<OptimizationReportCardProps> = ({ report }) => {
  if (!report || report.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mt-4">
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        Optimization Report
      </h3>
      <div className="space-y-3">
        {report.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-700">{item.change}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
