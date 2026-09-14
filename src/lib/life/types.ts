/**
 * Tipos do "Painel da Vida".
 *
 * O painel é alimentado por um snapshot: um JSON com o estado atual da sua vida
 * (agenda, tarefas, inbox, notas, arquivos) extraído dos conectores. Ver
 * `src/lib/life/snapshot.ts` para a ordem de resolução das fontes.
 */

export type ConnectorId =
  | "google-calendar"
  | "gmail"
  | "todoist"
  | "notion"
  | "google-drive"
  | "spotify"
  | "slack"
  | "vercel"
  | "github"
  | "supabase";

export type ConnectorStatus = "connected" | "needs_reconnect" | "off";

export interface Connector {
  id: ConnectorId;
  name: string;
  /** Área da vida que este conector abastece. */
  area: string;
  status: ConnectorStatus;
  /** O que exatamente ele alimenta no painel. */
  feeds: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  /** ISO 8601, com offset. */
  start: string;
  end: string;
  description?: string;
  url?: string;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  /** ISO 8601 (data ou data-hora). Ausente = sem prazo. */
  due?: string;
  priority?: 1 | 2 | 3 | 4;
  url?: string;
}

export interface InboxThread {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  date: string;
  unread: boolean;
  url?: string;
}

export interface NoteRef {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface FileRef {
  id: string;
  title: string;
  url: string;
  modifiedAt: string;
  kind?: string;
}

export interface LifeSnapshot {
  /** Quando este snapshot foi gerado (ISO 8601). */
  generatedAt: string;
  owner: {
    name: string;
    email: string;
    timeZone: string;
  };
  connectors: Connector[];
  agenda: AgendaEvent[];
  tasks: Task[];
  inbox: InboxThread[];
  notes: NoteRef[];
  files: FileRef[];
  /** Verdadeiro quando o painel caiu no snapshot de exemplo. */
  isSample?: boolean;
}
