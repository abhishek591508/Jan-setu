const styles = {
  open: 'bg-saffron/15 text-saffron-600',
  in_progress: 'bg-navy/10 text-navy',
  resolved: 'bg-civic/15 text-civic',
};

const labels = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
}
