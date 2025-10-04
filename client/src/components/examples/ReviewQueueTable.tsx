import { ReviewQueueTable } from '../ReviewQueueTable';

export default function ReviewQueueTableExample() {
  const labs = [
    {
      id: "1",
      title: "Introduction to React Hooks",
      authorName: "John Doe",
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "pending" as const,
      tags: ["React", "JavaScript", "Frontend"],
    },
    {
      id: "2",
      title: "Advanced TypeScript Patterns",
      authorName: "Jane Smith",
      submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: "pending" as const,
      tags: ["TypeScript", "Patterns"],
    },
  ];

  return (
    <div className="max-w-5xl">
      <ReviewQueueTable 
        labs={labs} 
        onReview={(id) => console.log('Review lab:', id)} 
      />
    </div>
  );
}
