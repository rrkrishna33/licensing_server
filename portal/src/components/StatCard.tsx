interface Props {
  title: string;
  value: number | string;
  sub?: string;
  color?: string;
}

export default function StatCard({ title, value, sub, color = 'text-indigo-600' }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-1">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
