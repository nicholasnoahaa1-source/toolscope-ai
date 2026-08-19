/**
 * Tela deliberadamente genérica: quem não tem uma sessão válida não deve
 * ver nenhum indício de que existe um JARVIS privado aqui — nem tema
 * escuro, nem núcleo holográfico, nem o nome do produto.
 */
export function NotFoundScreen() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 400 }}>404</h1>
      <p>Página não encontrada.</p>
    </main>
  )
}
