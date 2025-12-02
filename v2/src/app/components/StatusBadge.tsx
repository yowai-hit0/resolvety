'use client';

import { TicketStatus } from '@/types';

interface StatusBadgeProps {
  status: TicketStatus | string;
  className?: string;
}

const STATUS_CLASSES: Record<string, string> = {
  'New': 'status-new',
  'Assigned': 'status-open',
  'In_Progress': 'status-open',
  'On_Hold': 'status-open',
  'Reopened': 'status-open',
  'Resolved': 'status-resolved',
  'Closed': 'status-closed',
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusClass = STATUS_CLASSES[status] || 'status-new';
  const displayStatus = status.replace('_', ' ');

  return (
    <span className={`status-badge ${statusClass} ${className}`}>
      {displayStatus}
    </span>
  );
}

