import { LabForm } from '../LabForm';

export default function LabFormExample() {
  return (
    <div className="max-w-3xl p-6">
      <LabForm
        onSubmit={(values) => console.log('Form submitted:', values)}
        onCancel={() => console.log('Cancelled')}
      />
    </div>
  );
}
