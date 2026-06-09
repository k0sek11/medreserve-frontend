type SummaryCardProps = {
    label: string;
    value: string;
};

export const SummaryCard = ({ label, value }: SummaryCardProps) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {label}
        </span>
        <span className="text-slate-800 font-bold text-base">{value}</span>
    </div>
);
