const STATUS_CLASS = {
  WAITING: "waiting",
  RESERVED: "reserved",
  SERVING: "serving",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  open: "open",
  closed: "closed",
  upcoming: "waiting",
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const slug = STATUS_CLASS[status] || status.toLowerCase();
  return <span className={`badge badge-${slug}`}>{status}</span>;
}
