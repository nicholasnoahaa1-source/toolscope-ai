export default function Logo({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo-senac.png" alt="Senac" className={`h-7 w-auto ${className}`} />;
}
