import type { Metadata } from "next";
import BasketballClient from "./BasketballClient";

export const metadata: Metadata = {
  title: "Análise de Arremessos de Basquete",
  description: "Registro e análise de arremessos de basquete por zona da quadra, com treinos guiados e estatísticas.",
};

export default function BasketballPage() {
  return <BasketballClient />;
}
