'use client';

interface AnalyticsStatCardProps {
  label: string;
  value: string;
  sub?: string;
  gradient: string;
  icon: React.ReactNode;
}

function AnalyticsStatCard({ label, value, sub, gradient, icon }: AnalyticsStatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl p-5 bg-white/5 border border-white/10">
      <div className={`absolute inset-0 opacity-[0.07] bg-gradient-to-br ${gradient}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider truncate">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-white truncate">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
        </div>
        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${gradient} opacity-90`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export { AnalyticsStatCard };
