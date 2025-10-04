import { StatsCard } from '../StatsCard';
import { FileText, Clock, CheckCircle } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
      <StatsCard
        title="Draft Labs"
        value={5}
        icon={FileText}
        iconColor="text-status-draft"
        testId="card-drafts"
      />
      <StatsCard
        title="Pending Review"
        value={3}
        icon={Clock}
        iconColor="text-status-pending"
        testId="card-pending"
      />
      <StatsCard
        title="Approved"
        value={12}
        icon={CheckCircle}
        iconColor="text-status-approved"
        testId="card-approved"
      />
    </div>
  );
}
