/**
 * Aproximação da logo do Senac (ícone "bandeira" azul + laranja acima do
 * wordmark "Senac" em azul-marinho), reconstruída a partir de fotos do
 * manual de marca — não é o arquivo vetorial oficial. Substitua por
 * `<img src="/logo-senac.svg" .../>` assim que tiver o SVG oficial.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 40 24" className="h-5 w-8" aria-hidden>
        <path d="M6 10 L38 2 L38 6 L14 12 Z" fill="var(--senac-blue)" />
        <path d="M2 16 L36 6 L38 12 L6 22 Z" fill="var(--senac-orange)" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-brand">Senac</span>
    </span>
  );
}
