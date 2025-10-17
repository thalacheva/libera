export default function Example({
  description,
  steps,
}: {
  description: string;
  steps: string[];
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-2">Пример</h2>
      <p className="mb-4">{description}</p>
      <ol className="list-decimal ml-6 mt-2 space-y-1">
        {steps.map(step => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
