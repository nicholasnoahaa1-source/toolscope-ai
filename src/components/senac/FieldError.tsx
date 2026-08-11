export default function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-md bg-brand-light px-3 py-2 text-sm text-brand-dark" role="alert">
      {message}
    </p>
  );
}
