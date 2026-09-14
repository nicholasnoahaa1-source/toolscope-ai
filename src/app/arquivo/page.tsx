import type { Metadata } from "next";
import ArquivoApp from "@/components/arquivo/ArquivoApp";

export const metadata: Metadata = {
  title: "Arquivo",
  description:
    "Guarde e organize trilhas sonoras, fotos, vídeos, tipografia, paletas de cor e documentos separados por categoria, com importação e exportação.",
};

export default function ArquivoPage() {
  return <ArquivoApp />;
}
