export default function Theorem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-red-200 dark:bg-red-900 p-6 rounded-2xl shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="mb-4">{description}</p>
    </div>
  );
}
