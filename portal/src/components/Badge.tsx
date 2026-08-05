type Status = 'active' | 'suspended' | 'expired' | 'cancelled' | boolean;

const MAP: Record<string, string> = {
  active:    'bg-green-100 text-green-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  expired:   'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-800',
  true:      'bg-green-100 text-green-800',
  false:     'bg-gray-100 text-gray-600'
};

export default function Badge({ value }: { value: Status }) {
  const label = typeof value === 'boolean' ? (value ? 'Active' : 'Inactive') : value;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${MAP[String(label)] ?? 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}
