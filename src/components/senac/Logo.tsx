/**
 * Logotipo de texto provisório nas cores institucionais do Senac.
 * Substitua por `<img src="/logo-senac.svg" .../>` com o arquivo oficial
 * assim que ele estiver disponível — este componente evita usar uma
 * reprodução não autorizada da marca gráfica real.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden
        className="inline-block h-6 w-4 rounded-[2px] bg-brand"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 70%)" }}
      />
      <span className="text-xl font-bold tracking-tight text-foreground">
        senac<span className="text-brand">.</span>
      </span>
    </span>
  );
}
