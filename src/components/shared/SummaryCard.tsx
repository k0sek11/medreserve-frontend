type SummaryCardProps = {
    label: string;
    value: string;
};

export const SummaryCard = ({ label, value }: SummaryCardProps) => (
    <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-slate-100 dark:border-neutral-700 shadow-sm flex flex-col justify-center">
        <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            {label}
        </span>
        <span className="text-slate-800 dark:text-gray-200 font-bold text-base">{value}</span>
    </div>
);
