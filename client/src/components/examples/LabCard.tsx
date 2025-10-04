import { LabCard } from '../LabCard';

export default function LabCardExample() {
  return (
    <div className="space-y-4 max-w-2xl">
      <LabCard
        id="1"
        title="Introduction to React Hooks"
        description="Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks with practical examples."
        status="draft"
        authorName="John Doe"
        updatedAt={new Date(Date.now() - 2 * 60 * 60 * 1000)}
        onEdit={() => console.log('Edit clicked')}
        onSubmit={() => console.log('Submit clicked')}
      />
      <LabCard
        id="2"
        title="Advanced TypeScript Patterns"
        description="Explore advanced TypeScript patterns and best practices for building scalable applications."
        status="pending"
        authorName="Jane Smith"
        updatedAt={new Date(Date.now() - 24 * 60 * 60 * 1000)}
        onView={() => console.log('View clicked')}
      />
    </div>
  );
}
