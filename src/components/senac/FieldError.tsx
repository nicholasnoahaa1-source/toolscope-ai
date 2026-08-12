export default function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-md bg-danger-light px-3 py-2 text-sm text-danger" role="alert">
      {message}
    </p>
  );
}
