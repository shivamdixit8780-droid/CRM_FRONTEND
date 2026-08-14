import "../../styles/StatusBadge.css";

function StatusBadge({ status }) {
  // Status ko lowercase karke class banao
  // "Proposal Sent" → "proposal-sent"
  const statusClass = status
    ? status.toLowerCase().replace(/\s+/g, "-")
    : "default";

  return (
    <span className={`status-badge status-${statusClass}`}>
      {status}
    </span>
  );
}

export default StatusBadge;