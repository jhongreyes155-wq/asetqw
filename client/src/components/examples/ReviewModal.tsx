import { ReviewModal } from '../ReviewModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ReviewModalExample() {
  const [open, setOpen] = useState(false);

  const lab = {
    id: "1",
    title: "Introduction to React Hooks",
    description: "Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks with practical examples.",
    authorName: "John Doe",
    status: "pending" as const,
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Review Modal</Button>
      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        lab={lab}
        onApprove={(id, comment) => console.log('Approved:', id, comment)}
        onReject={(id, comment) => console.log('Rejected:', id, comment)}
      />
    </>
  );
}
