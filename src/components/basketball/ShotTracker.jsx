"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  AreaChart,
  Area,
  LineChart,
  Line,
  Cell,
} from "recharts";
import * as XLSX from "xlsx";
import {
  Plus,
  Trash2,
  Undo2,
  Play,
  Pause,
  Users,
  Dumbbell,
  BarChart3,
  Target,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  Clock,
  Save,
  X as XIcon,
  Check,
  Award,
  SkipForward,
  UserPlus,
  AlertTriangle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Cores e tema                                                       */
/* ------------------------------------------------------------------ */
const COR = {
  fundo: "#070C16",
  fundoCard: "#0E1626",
  fundoCard2: "#121C30",
  borda: "#1E2A40",
  azul: "#2563EB",
  azulClaro: "#3B82F6",
  verde: "#22C55E",
  vermelho: "#EF4444",
  ambar: "#F59E0B",
  texto: "#E5EAF2",
  textoMuted: "#8996AC",
};

const FONTE_TITULO = "'Montserrat', sans-serif";
const FONTE_TEXTO = "'Inter', sans-serif";
const FONTE_NUMERO = "'Barlow Condensed', sans-serif";

/* ------------------------------------------------------------------ */
/*  Geometria da quadra (meia quadra FIBA, viewBox 500x470 = 15m x 14m)*/
/* ------------------------------------------------------------------ */
const COURT_W = 500;
const COURT_H = 470;
const BASKET = { x: 250, y: 52.5 };
const ARC_R = 225;
const FT_Y = 193;
const KEY_X1 = 250 - 81.5;
const KEY_X2 = 250 + 81.5;
const CORNER_X_L = 30;
const CORNER_X_R = 500 - 30;
const CORNER_Y = 100;
const CURTA_R = 130;
const ANG_MEDIA = 15; // graus, separa média E/C/D
const ANG_TOPO = 25; // graus, separa topo de asas
const RESTRICTED_R = 40;
const RIM_R = 8;

function polar(r, angDeg) {
  const rad = (angDeg * Math.PI) / 180;
  return { x: BASKET.x + r * Math.sin(rad), y: BASKET.y + r * Math.cos(rad) };
}

function arcPath(r, angStart, angEnd, steps = 24) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = angStart + ((angEnd - angStart) * i) / steps;
    pts.push(polar(r, a));
  }
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
}

function ringWedgePath(rInner, rOuter, angStart, angEnd, steps = 16) {
  const clamp = (p) => ({
    x: Math.max(3, Math.min(COURT_W - 3, p.x)),
    y: Math.max(3, Math.min(COURT_H - 3, p.y)),
  });
  const outer = [];
  for (let i = 0; i <= steps; i++) {
    const a = angStart + ((angEnd - angStart) * i) / steps;
    outer.push(clamp(polar(rOuter, a)));
  }
  const inner = [];
  if (rInner > 0) {
    for (let i = steps; i >= 0; i--) {
      const a = angStart + ((angEnd - angStart) * i) / steps;
      inner.push(clamp(polar(rInner, a)));
    }
  } else {
    inner.push(clamp(BASKET));
  }
  const all = [...outer, ...inner];
  return all.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ") + " Z";
}

function rectPath(x1, y1, x2, y2) {
  return `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`;
}

/* ------------------------------------------------------------------ */
/*  Zonas: lista, classificação, polígonos, referência de base         */
/* ------------------------------------------------------------------ */
const ZONAS = [
  "Garrafão",
  "Curta",
  "Média Esquerda",
  "Média Centro",
  "Média Direita",
  "Canto Esquerdo",
  "Canto Direito",
  "Asa Esquerda",
  "Asa Direita",
  "Topo de Chave",
  "Lance Livre",
];

const ZONA_ABREV = {
  "Garrafão": "Garr.",
  "Curta": "Curta",
  "Média Esquerda": "Méd. E",
  "Média Centro": "Méd. C",
  "Média Direita": "Méd. D",
  "Canto Esquerdo": "Canto E",
  "Canto Direito": "Canto D",
  "Asa Esquerda": "Asa E",
  "Asa Direita": "Asa D",
  "Topo de Chave": "Topo",
  "Lance Livre": "L. Livre",
};

// referência de aproveitamento para categoria de base (%), 0-1
const ZONA_REFERENCIA = {
  "Garrafão": 0.55,
  "Curta": 0.45,
  "Média Esquerda": 0.35,
  "Média Centro": 0.38,
  "Média Direita": 0.35,
  "Canto Esquerdo": 0.33,
  "Canto Direito": 0.33,
  "Asa Esquerda": 0.32,
  "Asa Direita": 0.32,
  "Topo de Chave": 0.3,
  "Lance Livre": 0.7,
};

const ZONA_PONTOS = {
  "Garrafão": 2,
  "Curta": 2,
  "Média Esquerda": 2,
  "Média Centro": 2,
  "Média Direita": 2,
  "Canto Esquerdo": 3,
  "Canto Direito": 3,
  "Asa Esquerda": 3,
  "Asa Direita": 3,
  "Topo de Chave": 3,
  "Lance Livre": 1, // lance livre vale 1 ponto por arremesso
};

function classificarZona(x, y) {
  if (x >= KEY_X1 && x <= KEY_X2 && y >= 0 && y <= FT_Y) {
    return "Garrafão";
  }
  if (x >= 205 && x <= 295 && y > FT_Y && y <= 215) {
    return "Lance Livre";
  }
  if ((x <= CORNER_X_L || x >= CORNER_X_R) && y >= 0 && y <= CORNER_Y) {
    return x <= CORNER_X_L ? "Canto Esquerdo" : "Canto Direito";
  }
  const dx = x - BASKET.x;
  const dy = y - BASKET.y;
  const d = Math.hypot(dx, dy);
  const ang = (Math.atan2(dx, dy) * 180) / Math.PI;
  if (d < CURTA_R) return "Curta";
  if (d < ARC_R) {
    if (ang <= -ANG_MEDIA) return "Média Esquerda";
    if (ang >= ANG_MEDIA) return "Média Direita";
    return "Média Centro";
  }
  if (ang <= -ANG_TOPO) return "Asa Esquerda";
  if (ang >= ANG_TOPO) return "Asa Direita";
  return "Topo de Chave";
}

const ZONA_POLIGONO = {
  "Garrafão": rectPath(KEY_X1, 0, KEY_X2, FT_Y),
  "Lance Livre": rectPath(205, FT_Y, 295, 215),
  "Canto Esquerdo": rectPath(0, 0, CORNER_X_L, CORNER_Y),
  "Canto Direito": rectPath(CORNER_X_R, 0, COURT_W, CORNER_Y),
  "Curta": ringWedgePath(95, CURTA_R, -80, 80),
  "Média Esquerda": ringWedgePath(CURTA_R, ARC_R, -80, -ANG_MEDIA),
  "Média Centro": ringWedgePath(CURTA_R, ARC_R, -ANG_MEDIA, ANG_MEDIA),
  "Média Direita": ringWedgePath(CURTA_R, ARC_R, ANG_MEDIA, 80),
  "Asa Esquerda": ringWedgePath(ARC_R, 315, -70, -ANG_TOPO),
  "Asa Direita": ringWedgePath(ARC_R, 315, ANG_TOPO, 70),
  "Topo de Chave": ringWedgePath(ARC_R, 315, -ANG_TOPO, ANG_TOPO),
};

const ZONA_CENTRO = {
  "Garrafão": { x: 250, y: 122 },
  "Lance Livre": { x: 250, y: 204 },
  "Canto Esquerdo": { x: 15, y: 55 },
  "Canto Direito": { x: 485, y: 55 },
  "Curta": polar(112, 0),
  "Média Esquerda": polar(177, -45),
  "Média Centro": polar(177, 0),
  "Média Direita": polar(177, 45),
  "Asa Esquerda": polar(267, -45),
  "Asa Direita": polar(267, 45),
  "Topo de Chave": polar(267, 0),
};

/* ------------------------------------------------------------------ */
/*  Cor de calor                                                       */
/* ------------------------------------------------------------------ */
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function lerpColor(a, b, k) {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * k);
  const g = Math.round(pa.g + (pb.g - pa.g) * k);
  const bl = Math.round(pa.b + (pb.b - pa.b) * k);
  return `rgb(${r},${g},${bl})`;
}
function corDeCalor(t) {
  const c = Math.max(0, Math.min(1, t));
  if (c < 0.5) return lerpColor(COR.vermelho, COR.ambar, c / 0.5);
  return lerpColor(COR.ambar, COR.verde, (c - 0.5) / 0.5);
}

/* ------------------------------------------------------------------ */
/*  Utilidades gerais                                                  */
/* ------------------------------------------------------------------ */
function uid() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* ignora */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatarDataHora(ts) {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatarData(ts) {
  return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function pct(v, casas = 0) {
  return `${(v * 100).toFixed(casas)}%`;
}
function pp(v, casas = 0) {
  const n = v * 100;
  const s = n >= 0 ? "+" : "";
  return `${s}${n.toFixed(casas)} p.p.`;
}
function mmss(seg) {
  const m = Math.floor(seg / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seg % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
function dateKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Persistência via window.storage (com fallback em memória)          */
/* ------------------------------------------------------------------ */
const memoriaFallback = {};

async function storageGet(chave, valorPadrao) {
  try {
    if (typeof window !== "undefined" && window.storage && typeof window.storage.get === "function") {
      const v = await window.storage.get(chave);
      return v === undefined || v === null ? valorPadrao : v;
    }
  } catch {
    /* cai no fallback */
  }
  return Object.prototype.hasOwnProperty.call(memoriaFallback, chave) ? memoriaFallback[chave] : valorPadrao;
}

async function storageSet(chave, valor) {
  memoriaFallback[chave] = valor;
  try {
    if (typeof window !== "undefined" && window.storage && typeof window.storage.set === "function") {
      await window.storage.set(chave, valor);
    }
  } catch {
    /* mantém só em memória */
  }
}

async function storageDelete(chave) {
  delete memoriaFallback[chave];
  try {
    if (typeof window !== "undefined" && window.storage && typeof window.storage.delete === "function") {
      await window.storage.delete(chave);
    }
  } catch {
    /* ignora */
  }
}

async function storageList() {
  try {
    if (typeof window !== "undefined" && window.storage && typeof window.storage.list === "function") {
      const chaves = await window.storage.list();
      if (Array.isArray(chaves)) return chaves;
    }
  } catch {
    /* cai no fallback */
  }
  return Object.keys(memoriaFallback);
}

const CHAVES = {
  atletas: "bb_atletas",
  arremessos: "bb_arremessos",
  sessoes: "bb_sessoes",
  drillRecords: "bb_drill_records",
  recordes: "bb_recordes_pessoais",
  drillsCustom: "bb_drills_custom",
  atletaAtual: "bb_atleta_atual",
};

/* ------------------------------------------------------------------ */
/*  Biblioteca de treinos guiados (drills reais)                       */
/* ------------------------------------------------------------------ */
const DRILLS_BASE = [
  {
    id: "mikan",
    nome: "Mikan Drill",
    categoria: "Finalização",
    descricao: "Bandejas alternadas embaixo da cesta, sem quicar a bola, alternando mão direita e esquerda.",
    descansoBlocoSeg: 20,
    blocos: [
      { zona: "Garrafão", repeticoes: 10 },
      { zona: "Garrafão", repeticoes: 10 },
    ],
  },
  {
    id: "volta-mundo",
    nome: "Volta ao Mundo",
    categoria: "Média distância",
    descricao: "Sequência de 5 posições de média distância ao redor do garrafão, do lado esquerdo ao direito.",
    descansoBlocoSeg: 10,
    blocos: [
      { zona: "Curta", repeticoes: 4 },
      { zona: "Média Esquerda", repeticoes: 4 },
      { zona: "Média Centro", repeticoes: 4 },
      { zona: "Média Direita", repeticoes: 4 },
      { zona: "Curta", repeticoes: 4 },
    ],
  },
  {
    id: "5-spots-3",
    nome: "5 Spots de Três",
    categoria: "Arremesso de 3",
    descricao: "Cinco posições de arremesso de 3 pontos: cantos, asas e topo de chave.",
    descansoBlocoSeg: 15,
    blocos: [
      { zona: "Canto Esquerdo", repeticoes: 5 },
      { zona: "Asa Esquerda", repeticoes: 5 },
      { zona: "Topo de Chave", repeticoes: 5 },
      { zona: "Asa Direita", repeticoes: 5 },
      { zona: "Canto Direito", repeticoes: 5 },
    ],
  },
  {
    id: "pacote-pivo",
    nome: "Pacote de Pivô",
    categoria: "Jogo de costas",
    descricao: "Séries de arremessos de garrafão trabalhando gancho e perna do meio, simulando jogo de pivô.",
    descansoBlocoSeg: 30,
    blocos: [
      { zona: "Garrafão", repeticoes: 8 },
      { zona: "Garrafão", repeticoes: 8 },
      { zona: "Garrafão", repeticoes: 8 },
    ],
  },
  {
    id: "ll-pressao",
    nome: "Lance Livre sob Pressão",
    categoria: "Lance livre",
    descricao: "Séries de 2 lances livres, simulando pressão de jogo, com descanso curto entre as séries.",
    descansoBlocoSeg: 12,
    blocos: Array.from({ length: 6 }, () => ({ zona: "Lance Livre", repeticoes: 2 })),
  },
  {
    id: "catch-shoot",
    nome: "Catch & Shoot",
    categoria: "Arremesso de 3",
    descricao: "Recepção e arremesso imediato em diferentes posições ao redor do perímetro.",
    descansoBlocoSeg: 15,
    blocos: [
      { zona: "Média Centro", repeticoes: 6 },
      { zona: "Asa Esquerda", repeticoes: 6 },
      { zona: "Topo de Chave", repeticoes: 6 },
      { zona: "Asa Direita", repeticoes: 6 },
    ],
  },
  {
    id: "fechamento-fadiga",
    nome: "Fechamento sob Fadiga",
    categoria: "Condicionamento",
    descricao: "Alterna zonas curtas e médias com descanso mínimo, simulando arremesso no fim do jogo, sob fadiga.",
    descansoBlocoSeg: 5,
    blocos: [
      { zona: "Curta", repeticoes: 6 },
      { zona: "Média Esquerda", repeticoes: 6 },
      { zona: "Curta", repeticoes: 6 },
      { zona: "Média Direita", repeticoes: 6 },
      { zona: "Topo de Chave", repeticoes: 6 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Métricas derivadas do log de arremessos                            */
/* ------------------------------------------------------------------ */
function computarEstatisticas(arremessos) {
  const total = arremessos.length;
  const acertos = arremessos.filter((a) => a.acertou).length;
  const aproveitamento = total ? acertos / total : 0;
  const treses = arremessos.filter((a) => a.pontos === 3);
  const tresesFeitos = treses.filter((a) => a.acertou).length;
  const arremessosQuadra = arremessos.filter((a) => a.zona !== "Lance Livre");
  const acertosQuadra = arremessosQuadra.filter((a) => a.acertou).length;
  const efg = arremessosQuadra.length ? (acertosQuadra + 0.5 * tresesFeitos) / arremessosQuadra.length : 0;
  const pontosTotais = arremessos.reduce((s, a) => s + (a.acertou ? a.pontos : 0), 0);
  const pps = total ? pontosTotais / total : 0;

  const ordenado = [...arremessos].sort((a, b) => a.timestamp - b.timestamp);
  let max = 0;
  let cur = 0;
  ordenado.forEach((a) => {
    if (a.acertou) {
      cur += 1;
      max = Math.max(max, cur);
    } else {
      cur = 0;
    }
  });

  return { total, acertos, aproveitamento, efg, pps, pontosTotais, sequenciaMaxima: max, sequenciaAtual: cur };
}

function computarEstatisticasPorZona(arremessos) {
  const mapa = {};
  ZONAS.forEach((z) => {
    mapa[z] = { zona: z, tentativas: 0, acertos: 0, pontosTotais: 0 };
  });
  arremessos.forEach((a) => {
    const z = mapa[a.zona];
    if (!z) return;
    z.tentativas += 1;
    if (a.acertou) {
      z.acertos += 1;
      z.pontosTotais += a.pontos;
    }
  });
  Object.values(mapa).forEach((z) => {
    z.aproveitamento = z.tentativas ? z.acertos / z.tentativas : 0;
    z.pps = z.tentativas ? z.pontosTotais / z.tentativas : 0;
    z.referencia = ZONA_REFERENCIA[z.zona];
    z.gap = z.tentativas ? z.aproveitamento - z.referencia : null;
  });
  return mapa;
}

function gerarAnaliseTexto(nomeAtleta, arremessos, sessoes) {
  if (!arremessos.length) {
    return ["Ainda não há arremessos registrados para este atleta. Registre alguns arremessos para gerar a análise automática."];
  }
  const paragrafos = [];
  const porZona = computarEstatisticasPorZona(arremessos);
  const comDados = Object.values(porZona).filter((z) => z.tentativas >= 5);

  if (comDados.length) {
    const melhor = [...comDados].sort((a, b) => b.aproveitamento - a.aproveitamento)[0];
    paragrafos.push(
      `Melhor zona: ${melhor.zona}, com ${pct(melhor.aproveitamento)} de aproveitamento em ${melhor.tentativas} arremessos.`
    );

    const prioritaria = [...comDados].sort((a, b) => a.gap - b.gap)[0];
    if (prioritaria.gap < 0) {
      paragrafos.push(
        `Zona prioritária para treino: ${prioritaria.zona}, ${pp(prioritaria.gap)} abaixo da referência de categoria de base (${pct(
          prioritaria.referencia
        )}).`
      );
    } else {
      paragrafos.push(`Todas as zonas com volume suficiente estão dentro ou acima da referência de categoria de base — ótimo sinal de consistência.`);
    }

    const rentavel = [...comDados].sort((a, b) => b.pps - a.pps)[0];
    paragrafos.push(`Zona mais rentável em pontos por arremesso: ${rentavel.zona}, com ${rentavel.pps.toFixed(2)} PPS.`);
  } else {
    paragrafos.push("Ainda não há zonas com volume suficiente (mínimo de 5 arremessos) para apontar melhor zona ou zona prioritária.");
  }

  const sessoesAtleta = [...sessoes].sort((a, b) => a.inicio - b.inicio);
  const ultimaSessao = sessoesAtleta[sessoesAtleta.length - 1];
  if (ultimaSessao) {
    const shotsUltima = arremessos
      .filter((a) => a.sessionId === ultimaSessao.id)
      .sort((a, b) => a.timestamp - b.timestamp);
    if (shotsUltima.length >= 10) {
      const meio = Math.floor(shotsUltima.length / 2);
      const primeira = shotsUltima.slice(0, meio);
      const segunda = shotsUltima.slice(meio);
      const pctPrimeira = primeira.filter((a) => a.acertou).length / primeira.length;
      const pctSegunda = segunda.filter((a) => a.acertou).length / segunda.length;
      const queda = pctPrimeira - pctSegunda;
      if (queda > 0.05) {
        paragrafos.push(
          `Queda de rendimento na última sessão: de ${pct(pctPrimeira)} na primeira metade para ${pct(
            pctSegunda
          )} na segunda metade — sinal de fadiga ao longo do treino.`
        );
      } else if (queda < -0.05) {
        paragrafos.push(
          `Rendimento subiu ao longo da última sessão: de ${pct(pctPrimeira)} na primeira metade para ${pct(
            pctSegunda
          )} na segunda metade.`
        );
      } else {
        paragrafos.push(`Rendimento estável ao longo da última sessão, sem queda relevante por fadiga.`);
      }
    }
  }

  if (sessoesAtleta.length >= 2 && ultimaSessao) {
    const shotsUltima = arremessos.filter((a) => a.sessionId === ultimaSessao.id);
    const shotsAnteriores = arremessos.filter((a) => a.sessionId !== ultimaSessao.id);
    if (shotsUltima.length && shotsAnteriores.length) {
      const pctUltima = shotsUltima.filter((a) => a.acertou).length / shotsUltima.length;
      const pctHistorico = shotsAnteriores.filter((a) => a.acertou).length / shotsAnteriores.length;
      const dif = pctUltima - pctHistorico;
      paragrafos.push(
        `Comparado à média histórica (${pct(pctHistorico)}), a última sessão de ${nomeAtleta} teve ${pct(pctUltima)} de aproveitamento (${pp(dif)}).`
      );
    }
  }

  return paragrafos;
}

/* ------------------------------------------------------------------ */
/*  Componente: SVG da quadra                                          */
/* ------------------------------------------------------------------ */
function QuadraSVG({
  arremessos,
  onTocar,
  modoRegistro,
  mostrarCalor,
  modoCalor,
  zonaAlvo,
  pulsar,
}) {
  const svgRef = useRef(null);

  const handlePointer = useCallback(
    (evento) => {
      if (!modoRegistro || !svgRef.current) return;
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      const clientX = evento.touches && evento.touches[0] ? evento.touches[0].clientX : evento.clientX;
      const clientY = evento.touches && evento.touches[0] ? evento.touches[0].clientY : evento.clientY;
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const local = pt.matrixTransform(ctm.inverse());
      const x = Math.max(0, Math.min(COURT_W, local.x));
      const y = Math.max(0, Math.min(COURT_H, local.y));
      onTocar(x, y);
    },
    [modoRegistro, onTocar]
  );

  const porZona = useMemo(() => computarEstatisticasPorZona(arremessos), [arremessos]);
  const cornerArcStartAng = useMemo(() => {
    const dx = CORNER_X_L - BASKET.x;
    const dy = CORNER_Y - BASKET.y;
    return (Math.atan2(dx, dy) * 180) / Math.PI;
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${COURT_W} ${COURT_H}`}
      onClick={handlePointer}
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        background: "#0A1220",
        borderRadius: 12,
        touchAction: "manipulation",
        cursor: modoRegistro ? "crosshair" : "default",
      }}
    >
      {/* mapa de calor por zona */}
      {mostrarCalor &&
        ZONAS.filter((z) => z !== "Lance Livre" || zonaAlvo === "Lance Livre" || !modoRegistro).map((zona) => {
          const dados = porZona[zona];
          const temDados = dados.tentativas > 0;
          const valor = modoCalor === "pct" ? dados.aproveitamento : Math.min(1, dados.pps / 1.5);
          const cor = temDados ? corDeCalor(valor) : "#1A2332";
          const centro = ZONA_CENTRO[zona] || { x: 250, y: 235 };
          return (
            <g key={zona}>
              <path d={ZONA_POLIGONO[zona]} fill={cor} opacity={temDados ? 0.55 : 0.35} stroke="#0A1220" strokeWidth={1.5} />
              <text
                x={centro.x}
                y={centro.y - 4}
                textAnchor="middle"
                fontFamily={FONTE_TEXTO}
                fontSize={11}
                fontWeight={700}
                fill="#F5F7FA"
                style={{ pointerEvents: "none" }}
              >
                {temDados ? (modoCalor === "pct" ? pct(dados.aproveitamento) : dados.pps.toFixed(2)) : "—"}
              </text>
              <text
                x={centro.x}
                y={centro.y + 9}
                textAnchor="middle"
                fontFamily={FONTE_TEXTO}
                fontSize={8}
                fill="#C7CEDA"
                style={{ pointerEvents: "none" }}
              >
                {ZONA_ABREV[zona]} {temDados ? `(${dados.tentativas})` : ""}
              </text>
            </g>
          );
        })}

      {/* linhas da quadra */}
      <g stroke="#5B6B85" strokeWidth={2} fill="none" opacity={0.9}>
        <rect x={1} y={1} width={COURT_W - 2} height={COURT_H - 2} />
        <rect x={KEY_X1} y={0} width={KEY_X2 - KEY_X1} height={FT_Y} />
        <circle cx={250} cy={FT_Y} r={60} />
        <path d={arcPath(RESTRICTED_R, -90, 90)} />
        <path
          d={`M ${CORNER_X_L} 0 L ${CORNER_X_L} ${CORNER_Y} ${arcPath(ARC_R, cornerArcStartAng, -cornerArcStartAng)
            .replace("M", "L")} L ${CORNER_X_R} 0`}
        />
        <line x1={0} y1={0} x2={COURT_W} y2={0} strokeWidth={3} />
        <rect x={220} y={40} width={60} height={4} fill="#5B6B85" stroke="none" />
      </g>
      <circle cx={BASKET.x} cy={BASKET.y} r={RIM_R} fill="none" stroke={COR.ambar} strokeWidth={2.5} />

      {/* alvo pulsante do drill */}
      {zonaAlvo && ZONA_CENTRO[zonaAlvo] && (
        <circle
          cx={ZONA_CENTRO[zonaAlvo].x}
          cy={ZONA_CENTRO[zonaAlvo].y}
          r={pulsar ? 22 : 16}
          fill="none"
          stroke={COR.azulClaro}
          strokeWidth={3}
          opacity={0.85}
          style={{ transition: "r 0.5s ease-in-out" }}
        />
      )}

      {/* marcações dos arremessos */}
      {arremessos.map((a) =>
        a.acertou ? (
          <circle key={a.id} cx={a.x} cy={a.y} r={5.5} fill={COR.verde} stroke="#08240F" strokeWidth={1} opacity={0.92} />
        ) : (
          <g key={a.id} stroke={COR.vermelho} strokeWidth={2.4} opacity={0.92}>
            <line x1={a.x - 5} y1={a.y - 5} x2={a.x + 5} y2={a.y + 5} />
            <line x1={a.x - 5} y1={a.y + 5} x2={a.x + 5} y2={a.y - 5} />
          </g>
        )
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Calendário de consistência (12 semanas)                            */
/* ------------------------------------------------------------------ */
function CalendarioConsistencia({ arremessos }) {
  const dias = useMemo(() => {
    const contagem = {};
    arremessos.forEach((a) => {
      const k = dateKey(a.timestamp);
      contagem[k] = (contagem[k] || 0) + 1;
    });
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const lista = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      lista.push({ key: k, data: d, qtd: contagem[k] || 0 });
    }
    return lista;
  }, [arremessos]);

  const streak = useMemo(() => {
    let s = 0;
    for (let i = dias.length - 1; i >= 0; i--) {
      if (dias[i].qtd > 0) s += 1;
      else break;
    }
    return s;
  }, [dias]);

  const max = Math.max(1, ...dias.map((d) => d.qtd));
  const semanas = [];
  for (let i = 0; i < dias.length; i += 7) semanas.push(dias.slice(i, i + 7));

  return (
    <div>
      <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
        {semanas.map((semana, si) => (
          <div key={si} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {semana.map((d) => (
              <div
                key={d.key}
                title={`${formatarData(d.data.getTime())}: ${d.qtd} arremesso(s)`}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: d.qtd === 0 ? "#141F32" : corDeCalor(Math.min(1, d.qtd / max)),
                  opacity: d.qtd === 0 ? 1 : 0.35 + 0.65 * Math.min(1, d.qtd / max),
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <p style={{ fontFamily: FONTE_TEXTO, fontSize: 13, color: COR.textoMuted, marginTop: 8 }}>
        Sequência atual de dias com treino:{" "}
        <span style={{ color: COR.ambar, fontFamily: FONTE_NUMERO, fontSize: 18 }}>{streak}</span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Fontes (Google Fonts) — injetadas uma única vez                    */
/* ------------------------------------------------------------------ */
function useFontes() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("bb-fontes")) return;
    const link = document.createElement("link");
    link.id = "bb-fontes";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@800&family=Inter:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Primitivas de UI                                                   */
/* ------------------------------------------------------------------ */
function Cartao({ children, style, className }) {
  return (
    <div
      className={className}
      style={{
        background: COR.fundoCard,
        border: `1px solid ${COR.borda}`,
        borderRadius: 14,
        padding: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Titulo({ children, style }) {
  return (
    <h2
      style={{
        fontFamily: FONTE_TITULO,
        fontWeight: 800,
        color: COR.texto,
        fontSize: 16,
        textTransform: "uppercase",
        letterSpacing: 0.4,
        margin: "0 0 10px 0",
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

function NumeroPlacar({ valor, rotulo, cor = COR.texto, tamanho = 34 }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: FONTE_NUMERO, fontSize: tamanho, fontWeight: 700, color: cor, lineHeight: 1 }}>{valor}</div>
      <div style={{ fontFamily: FONTE_TEXTO, fontSize: 11, color: COR.textoMuted, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.3 }}>
        {rotulo}
      </div>
    </div>
  );
}

function Botao({ children, onClick, variante = "primario", disabled, style, icone: Icone, tipo = "button" }) {
  const paletas = {
    primario: { bg: COR.azul, cor: "#fff", borda: COR.azul },
    sucesso: { bg: COR.verde, cor: "#04170A", borda: COR.verde },
    perigo: { bg: COR.vermelho, cor: "#fff", borda: COR.vermelho },
    aviso: { bg: COR.ambar, cor: "#241800", borda: COR.ambar },
    fantasma: { bg: "transparent", cor: COR.texto, borda: COR.borda },
  };
  const p = paletas[variante] || paletas.primario;
  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={disabled}
      className="bb-touch"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        minHeight: 44,
        padding: "0 16px",
        borderRadius: 10,
        border: `1px solid ${p.borda}`,
        background: p.bg,
        color: p.cor,
        fontFamily: FONTE_TEXTO,
        fontWeight: 600,
        fontSize: 14,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {Icone && <Icone size={17} />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Tela: Registro de arremessos                                       */
/* ------------------------------------------------------------------ */
function TelaRegistro({
  arremessosAtleta,
  sessaoAtiva,
  cronometroSeg,
  onIniciarSessao,
  onFinalizarSessao,
  onRegistrarArremesso,
  onDesfazer,
  onRemoverArremesso,
  mostrarCalor,
  setMostrarCalor,
  modoCalor,
  setModoCalor,
}) {
  const [ultimoResultado, setUltimoResultado] = useState("acerto");
  const stats = useMemo(() => computarEstatisticas(arremessosAtleta), [arremessosAtleta]);
  const recentes = useMemo(
    () => [...arremessosAtleta].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6),
    [arremessosAtleta]
  );

  const arremPorMinuto = useMemo(() => {
    if (!sessaoAtiva || cronometroSeg < 5) return 0;
    const daSessao = arremessosAtleta.filter((a) => a.sessionId === sessaoAtiva.id);
    return daSessao.length / (cronometroSeg / 60);
  }, [arremessosAtleta, sessaoAtiva, cronometroSeg]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Cartao style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={18} color={sessaoAtiva ? COR.verde : COR.textoMuted} />
          <span style={{ fontFamily: FONTE_NUMERO, fontSize: 26, color: sessaoAtiva ? COR.verde : COR.textoMuted }}>
            {mmss(cronometroSeg)}
          </span>
          <span style={{ fontFamily: FONTE_TEXTO, fontSize: 12, color: COR.textoMuted }}>
            {sessaoAtiva ? `${arremPorMinuto.toFixed(1)} arr./min` : "sessão parada"}
          </span>
        </div>
        {sessaoAtiva ? (
          <Botao variante="perigo" onClick={onFinalizarSessao} icone={Pause}>
            Encerrar
          </Botao>
        ) : (
          <Botao variante="sucesso" onClick={onIniciarSessao} icone={Play}>
            Iniciar sessão
          </Botao>
        )}
      </Cartao>

      <div style={{ display: "flex", gap: 8 }}>
        <Botao
          variante={ultimoResultado === "acerto" ? "sucesso" : "fantasma"}
          onClick={() => setUltimoResultado("acerto")}
          icone={Check}
          style={{ flex: 1 }}
        >
          Acertou
        </Botao>
        <Botao
          variante={ultimoResultado === "erro" ? "perigo" : "fantasma"}
          onClick={() => setUltimoResultado("erro")}
          icone={XIcon}
          style={{ flex: 1 }}
        >
          Errou
        </Botao>
      </div>

      <Cartao style={{ padding: 8 }}>
        <QuadraSVG
          arremessos={arremessosAtleta.filter((a) => !a.drillId)}
          modoRegistro
          onTocar={(x, y) => onRegistrarArremesso(x, y, ultimoResultado === "acerto")}
          mostrarCalor={mostrarCalor}
          modoCalor={modoCalor}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 8, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONTE_TEXTO, fontSize: 13, color: COR.textoMuted }}>
            <input type="checkbox" checked={mostrarCalor} onChange={(e) => setMostrarCalor(e.target.checked)} style={{ width: 18, height: 18 }} />
            Mapa de calor
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            <Botao
              variante={modoCalor === "pct" ? "primario" : "fantasma"}
              onClick={() => setModoCalor("pct")}
              style={{ minHeight: 34, padding: "0 12px", fontSize: 12 }}
            >
              %
            </Botao>
            <Botao
              variante={modoCalor === "pps" ? "primario" : "fantasma"}
              onClick={() => setModoCalor("pps")}
              style={{ minHeight: 34, padding: "0 12px", fontSize: 12 }}
            >
              PPS
            </Botao>
          </div>
        </div>
      </Cartao>

      <Cartao>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          <NumeroPlacar valor={pct(stats.aproveitamento)} rotulo="Aproveit." cor={COR.azulClaro} />
          <NumeroPlacar valor={pct(stats.efg)} rotulo="eFG%" cor={COR.ambar} />
          <NumeroPlacar valor={stats.pps.toFixed(2)} rotulo="PPS" cor={COR.verde} />
          <NumeroPlacar valor={stats.sequenciaAtual} rotulo="Sequência" cor={COR.texto} />
        </div>
      </Cartao>

      <Cartao>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Titulo style={{ margin: 0 }}>Log recente</Titulo>
          <Botao variante="fantasma" onClick={onDesfazer} icone={Undo2} disabled={!arremessosAtleta.length} style={{ minHeight: 36, padding: "0 12px", fontSize: 12 }}>
            Desfazer
          </Botao>
        </div>
        {recentes.length === 0 && <p style={{ color: COR.textoMuted, fontFamily: FONTE_TEXTO, fontSize: 13 }}>Nenhum arremesso ainda.</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {recentes.map((a) => (
            <div
              key={a.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                borderRadius: 8,
                background: COR.fundoCard2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    background: a.acertou ? COR.verde : COR.vermelho,
                    display: "inline-block",
                  }}
                />
                <span style={{ fontFamily: FONTE_TEXTO, fontSize: 13, color: COR.texto }}>{a.zona}</span>
                <span style={{ fontFamily: FONTE_TEXTO, fontSize: 11, color: COR.textoMuted }}>{formatarDataHora(a.timestamp)}</span>
              </div>
              <button
                onClick={() => onRemoverArremesso(a.id)}
                aria-label="Remover arremesso"
                className="bb-touch"
                style={{ background: "none", border: "none", color: COR.textoMuted, minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </Cartao>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tela: Treinos guiados                                              */
/* ------------------------------------------------------------------ */
function ConstrutorDrillCustom({ onSalvar, onCancelar }) {
  const [nome, setNome] = useState("");
  const [blocos, setBlocos] = useState([{ zona: ZONAS[0], repeticoes: 5 }]);
  const [descanso, setDescanso] = useState(15);

  function atualizarBloco(i, campo, valor) {
    setBlocos((bs) => bs.map((b, idx) => (idx === i ? { ...b, [campo]: valor } : b)));
  }
  function adicionarBloco() {
    setBlocos((bs) => [...bs, { zona: ZONAS[0], repeticoes: 5 }]);
  }
  function removerBloco(i) {
    setBlocos((bs) => bs.filter((_, idx) => idx !== i));
  }
  function salvar() {
    if (!nome.trim() || blocos.length === 0) return;
    onSalvar({
      id: `custom-${uid()}`,
      nome: nome.trim(),
      categoria: "Personalizado",
      descricao: "Treino personalizado criado pelo usuário.",
      descansoBlocoSeg: Number(descanso) || 0,
      blocos: blocos.map((b) => ({ zona: b.zona, repeticoes: Math.max(1, Number(b.repeticoes) || 1) })),
      custom: true,
    });
  }

  const inputEstilo = {
    width: "100%",
    minHeight: 44,
    borderRadius: 8,
    border: `1px solid ${COR.borda}`,
    background: COR.fundoCard2,
    color: COR.texto,
    fontFamily: FONTE_TEXTO,
    fontSize: 14,
    padding: "0 10px",
  };

  return (
    <Cartao>
      <Titulo>Novo treino personalizado</Titulo>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input placeholder="Nome do treino" value={nome} onChange={(e) => setNome(e.target.value)} style={inputEstilo} />
        <label style={{ fontFamily: FONTE_TEXTO, fontSize: 12, color: COR.textoMuted }}>Descanso entre blocos (segundos)</label>
        <input type="number" min={0} value={descanso} onChange={(e) => setDescanso(e.target.value)} style={inputEstilo} />
        {blocos.map((b, i) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <select value={b.zona} onChange={(e) => atualizarBloco(i, "zona", e.target.value)} style={{ ...inputEstilo, flex: 2 }}>
              {ZONAS.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={b.repeticoes}
              onChange={(e) => atualizarBloco(i, "repeticoes", e.target.value)}
              style={{ ...inputEstilo, flex: 1 }}
            />
            <button
              onClick={() => removerBloco(i)}
              aria-label="Remover bloco"
              className="bb-touch"
              style={{ minWidth: 44, minHeight: 44, background: "none", border: "none", color: COR.vermelho, cursor: "pointer" }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <Botao variante="fantasma" onClick={adicionarBloco} icone={Plus}>
          Adicionar bloco
        </Botao>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <Botao variante="sucesso" onClick={salvar} icone={Save} style={{ flex: 1 }}>
            Salvar treino
          </Botao>
          <Botao variante="fantasma" onClick={onCancelar} style={{ flex: 1 }}>
            Cancelar
          </Botao>
        </div>
      </div>
    </Cartao>
  );
}

function TelaTreinos({
  drillsDisponiveis,
  drillAtivo,
  personalRecords,
  atletaId,
  onIniciarDrill,
  onTocarQuadraDrill,
  onPularDescanso,
  onEncerrarDrill,
  onSalvarDrillCustom,
  ultimoResultado,
  setUltimoResultado,
}) {
  const [mostrarConstrutor, setMostrarConstrutor] = useState(false);

  if (drillAtivo) {
    const { drill, blocoIndex, tentativas, fase, descansoRestante, blocosResultado, recordeSuperado } = drillAtivo;

    if (fase === "fim") {
      const totalTentativas = blocosResultado.reduce((s, b) => s + b.tentativas, 0);
      const totalAcertos = blocosResultado.reduce((s, b) => s + b.acertos, 0);
      const pontuacao = blocosResultado.reduce((s, b) => s + b.acertos * (ZONA_PONTOS[b.zona] || 2), 0);
      return (
        <Cartao>
          <Titulo>Treino concluído: {drill.nome}</Titulo>
          {recordeSuperado && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.15)", padding: 10, borderRadius: 10, marginBottom: 12 }}>
              <Award size={20} color={COR.ambar} />
              <span style={{ fontFamily: FONTE_TEXTO, fontSize: 13, color: COR.ambar, fontWeight: 600 }}>Novo recorde pessoal!</span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
            <NumeroPlacar valor={`${totalAcertos}/${totalTentativas}`} rotulo="Acertos" cor={COR.verde} />
            <NumeroPlacar valor={pct(totalTentativas ? totalAcertos / totalTentativas : 0)} rotulo="Aproveit." cor={COR.azulClaro} />
            <NumeroPlacar valor={pontuacao} rotulo="Pontuação" cor={COR.ambar} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {blocosResultado.map((b, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: COR.fundoCard2, borderRadius: 8 }}>
                <span style={{ fontFamily: FONTE_TEXTO, fontSize: 13, color: COR.texto }}>
                  Bloco {i + 1} — {b.zona}
                </span>
                <span style={{ fontFamily: FONTE_NUMERO, fontSize: 16, color: COR.texto }}>
                  {b.acertos}/{b.tentativas}
                </span>
              </div>
            ))}
          </div>
          <Botao variante="primario" onClick={onEncerrarDrill} style={{ width: "100%" }}>
            Voltar para os treinos
          </Botao>
        </Cartao>
      );
    }

    const blocoAtual = drill.blocos[blocoIndex];
    if (fase === "descanso") {
      return (
        <Cartao style={{ textAlign: "center" }}>
          <Titulo>Descanso</Titulo>
          <div style={{ fontFamily: FONTE_NUMERO, fontSize: 64, color: COR.ambar }}>{descansoRestante}s</div>
          <p style={{ fontFamily: FONTE_TEXTO, color: COR.textoMuted, fontSize: 13, marginBottom: 14 }}>
            Próximo bloco: {drill.blocos[blocoIndex + 1]?.zona}
          </p>
          <Botao variante="fantasma" onClick={onPularDescanso} icone={SkipForward}>
            Pular descanso
          </Botao>
        </Cartao>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Cartao style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 14, color: COR.texto }}>{drill.nome}</div>
            <div style={{ fontFamily: FONTE_TEXTO, fontSize: 12, color: COR.textoMuted }}>
              Bloco {blocoIndex + 1} de {drill.blocos.length} — alvo: {blocoAtual.zona}
            </div>
          </div>
          <div style={{ fontFamily: FONTE_NUMERO, fontSize: 30, color: COR.azulClaro }}>
            {tentativas} de {blocoAtual.repeticoes}
          </div>
        </Cartao>
        <div style={{ display: "flex", gap: 8 }}>
          <Botao
            variante={ultimoResultado === "acerto" ? "sucesso" : "fantasma"}
            onClick={() => setUltimoResultado("acerto")}
            icone={Check}
            style={{ flex: 1 }}
          >
            Acertou
          </Botao>
          <Botao
            variante={ultimoResultado === "erro" ? "perigo" : "fantasma"}
            onClick={() => setUltimoResultado("erro")}
            icone={XIcon}
            style={{ flex: 1 }}
          >
            Errou
          </Botao>
        </div>
        <Cartao style={{ padding: 8 }}>
          <QuadraSVG
            arremessos={[]}
            modoRegistro
            onTocar={(x, y) => onTocarQuadraDrill(x, y, ultimoResultado === "acerto")}
            mostrarCalor={false}
            zonaAlvo={blocoAtual.zona}
            pulsar
          />
        </Cartao>
        <div style={{ display: "flex", gap: 6 }}>
          {blocosResultado.map((b, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", background: COR.fundoCard2, borderRadius: 8, padding: 6 }}>
              <div style={{ fontFamily: FONTE_NUMERO, fontSize: 16, color: COR.texto }}>
                {b.acertos}/{b.tentativas}
              </div>
              <div style={{ fontFamily: FONTE_TEXTO, fontSize: 9, color: COR.textoMuted }}>{ZONA_ABREV[b.zona]}</div>
            </div>
          ))}
        </div>
        <Botao variante="fantasma" onClick={onEncerrarDrill} icone={XIcon}>
          Cancelar treino
        </Botao>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {mostrarConstrutor ? (
        <ConstrutorDrillCustom
          onSalvar={(d) => {
            onSalvarDrillCustom(d);
            setMostrarConstrutor(false);
          }}
          onCancelar={() => setMostrarConstrutor(false)}
        />
      ) : (
        <Botao variante="fantasma" onClick={() => setMostrarConstrutor(true)} icone={Plus} style={{ width: "100%" }}>
          Montar treino personalizado
        </Botao>
      )}
      {drillsDisponiveis.map((drill) => {
        const recorde = personalRecords?.[atletaId]?.[drill.id];
        const totalReps = drill.blocos.reduce((s, b) => s + b.repeticoes, 0);
        return (
          <Cartao key={drill.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 15, color: COR.texto }}>{drill.nome}</div>
                <div style={{ fontFamily: FONTE_TEXTO, fontSize: 11, color: COR.azulClaro, textTransform: "uppercase", marginTop: 2 }}>
                  {drill.categoria}
                </div>
                <p style={{ fontFamily: FONTE_TEXTO, fontSize: 13, color: COR.textoMuted, margin: "6px 0" }}>{drill.descricao}</p>
                <div style={{ fontFamily: FONTE_TEXTO, fontSize: 12, color: COR.textoMuted }}>
                  {drill.blocos.length} blocos · {totalReps} arremessos
                  {recorde ? ` · recorde: ${recorde.melhorAcertos}/${recorde.melhorTentativas}` : ""}
                </div>
              </div>
            </div>
            <Botao variante="primario" onClick={() => onIniciarDrill(drill)} icone={Play} style={{ width: "100%", marginTop: 10 }}>
              Iniciar treino
            </Botao>
          </Cartao>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tela: Análise                                                      */
/* ------------------------------------------------------------------ */
function TooltipEscuro({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: COR.fundoCard2, border: `1px solid ${COR.borda}`, borderRadius: 8, padding: 8 }}>
      <p style={{ fontFamily: FONTE_TEXTO, fontSize: 12, color: COR.texto, margin: 0 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontFamily: FONTE_TEXTO, fontSize: 12, color: p.color, margin: 0 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
}

function TelaAnalise({ atleta, arremessosAtleta, sessoesAtleta }) {
  const analise = useMemo(() => gerarAnaliseTexto(atleta?.nome || "atleta", arremessosAtleta, sessoesAtleta), [atleta, arremessosAtleta, sessoesAtleta]);
  const porZona = useMemo(() => computarEstatisticasPorZona(arremessosAtleta), [arremessosAtleta]);

  const dadosRadar = ZONAS.filter((z) => z !== "Lance Livre").map((z) => ({
    zona: ZONA_ABREV[z],
    aproveitamento: Math.round(porZona[z].aproveitamento * 100),
    referencia: Math.round(ZONA_REFERENCIA[z] * 100),
  }));

  const dadosBarras = ZONAS.map((z) => ({ zona: ZONA_ABREV[z], pps: Number(porZona[z].pps.toFixed(2)), tentativas: porZona[z].tentativas }));

  const [sessaoSelecionadaId, setSessaoSelecionadaId] = useState("ultima");
  const sessoesOrdenadas = useMemo(() => [...sessoesAtleta].sort((a, b) => a.inicio - b.inicio), [sessoesAtleta]);
  const sessaoParaFadiga =
    sessaoSelecionadaId === "ultima" ? sessoesOrdenadas[sessoesOrdenadas.length - 1] : sessoesOrdenadas.find((s) => s.id === sessaoSelecionadaId);

  const dadosFadiga = useMemo(() => {
    if (!sessaoParaFadiga) return [];
    const shots = arremessosAtleta
      .filter((a) => a.sessionId === sessaoParaFadiga.id)
      .sort((a, b) => a.timestamp - b.timestamp);
    const blocos = [];
    for (let i = 0; i < shots.length; i += 10) {
      const bloco = shots.slice(i, i + 10);
      const acertos = bloco.filter((a) => a.acertou).length;
      blocos.push({ bloco: `${i + 1}-${i + bloco.length}`, aproveitamento: Math.round((acertos / bloco.length) * 100) });
    }
    return blocos;
  }, [arremessosAtleta, sessaoParaFadiga]);

  const dadosEvolucao = useMemo(() => {
    return sessoesOrdenadas.map((s, i) => {
      const shots = arremessosAtleta.filter((a) => a.sessionId === s.id);
      const st = computarEstatisticas(shots);
      return { sessao: `S${i + 1}`, aproveitamento: Math.round(st.aproveitamento * 100), pps: Number(st.pps.toFixed(2)) };
    });
  }, [sessoesOrdenadas, arremessosAtleta]);

  const eixoEstilo = { fontSize: 11, fill: COR.textoMuted, fontFamily: FONTE_TEXTO };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Cartao>
        <Titulo>Leitura automática</Titulo>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {analise.map((p, i) => (
            <p key={i} style={{ fontFamily: FONTE_TEXTO, fontSize: 13, color: COR.texto, margin: 0, lineHeight: 1.5 }}>
              {p}
            </p>
          ))}
        </div>
      </Cartao>

      <Cartao>
        <Titulo>Radar por zona (%)</Titulo>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <RadarChart data={dadosRadar}>
              <PolarGrid stroke={COR.borda} />
              <PolarAngleAxis dataKey="zona" tick={{ fontSize: 10, fill: COR.textoMuted, fontFamily: FONTE_TEXTO }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: COR.textoMuted }} />
              <Radar name="Aproveitamento" dataKey="aproveitamento" stroke={COR.azulClaro} fill={COR.azulClaro} fillOpacity={0.4} />
              <Radar name="Referência" dataKey="referencia" stroke={COR.ambar} fill={COR.ambar} fillOpacity={0.12} strokeDasharray="4 3" />
              <Tooltip content={<TooltipEscuro />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Cartao>

      <Cartao>
        <Titulo>PPS por zona</Titulo>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={dadosBarras} margin={{ left: -20 }}>
              <CartesianGrid stroke={COR.borda} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="zona" tick={eixoEstilo} interval={0} angle={-35} textAnchor="end" height={60} />
              <YAxis tick={eixoEstilo} domain={[0, "dataMax + 0.3"]} />
              <Tooltip content={<TooltipEscuro />} />
              <ReferenceLine y={1} stroke={COR.ambar} strokeDasharray="4 3" label={{ value: "1,00", position: "right", fill: COR.ambar, fontSize: 11 }} />
              <Bar dataKey="pps" radius={[4, 4, 0, 0]}>
                {dadosBarras.map((d, i) => (
                  <Cell key={i} fill={d.tentativas ? COR.azulClaro : "#22314A"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Cartao>

      <Cartao>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Titulo style={{ margin: 0 }}>Fadiga intra-sessão (blocos de 10)</Titulo>
        </div>
        {sessoesOrdenadas.length > 0 && (
          <select
            value={sessaoSelecionadaId}
            onChange={(e) => setSessaoSelecionadaId(e.target.value)}
            style={{
              minHeight: 40,
              borderRadius: 8,
              border: `1px solid ${COR.borda}`,
              background: COR.fundoCard2,
              color: COR.texto,
              fontFamily: FONTE_TEXTO,
              fontSize: 13,
              padding: "0 8px",
              marginBottom: 10,
            }}
          >
            <option value="ultima">Última sessão</option>
            {sessoesOrdenadas.map((s, i) => (
              <option key={s.id} value={s.id}>
                Sessão {i + 1} — {formatarData(s.inicio)}
              </option>
            ))}
          </select>
        )}
        {dadosFadiga.length === 0 ? (
          <p style={{ fontFamily: FONTE_TEXTO, fontSize: 13, color: COR.textoMuted }}>Sem dados suficientes nesta sessão.</p>
        ) : (
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <AreaChart data={dadosFadiga}>
                <CartesianGrid stroke={COR.borda} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bloco" tick={eixoEstilo} />
                <YAxis tick={eixoEstilo} domain={[0, 100]} />
                <Tooltip content={<TooltipEscuro />} />
                <Area type="monotone" dataKey="aproveitamento" stroke={COR.vermelho} fill={COR.vermelho} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Cartao>

      <Cartao>
        <Titulo>Evolução entre treinos</Titulo>
        {dadosEvolucao.length === 0 ? (
          <p style={{ fontFamily: FONTE_TEXTO, fontSize: 13, color: COR.textoMuted }}>Ainda não há sessões suficientes.</p>
        ) : (
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={dadosEvolucao}>
                <CartesianGrid stroke={COR.borda} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="sessao" tick={eixoEstilo} />
                <YAxis tick={eixoEstilo} domain={[0, 100]} />
                <Tooltip content={<TooltipEscuro />} />
                <Line type="monotone" dataKey="aproveitamento" stroke={COR.verde} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Cartao>

      <Cartao>
        <Titulo>Consistência (12 semanas)</Titulo>
        <CalendarioConsistencia arremessos={arremessosAtleta} />
      </Cartao>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exportação: Excel (SheetJS), PDF (impressão), backup JSON          */
/* ------------------------------------------------------------------ */
function exportarExcel({ atleta, arremessosAtleta, sessoesAtleta, drillRecordsAtleta }) {
  const stats = computarEstatisticas(arremessosAtleta);
  const porZona = computarEstatisticasPorZona(arremessosAtleta);

  const wb = XLSX.utils.book_new();

  const resumo = [
    { Métrica: "Atleta", Valor: atleta?.nome || "" },
    { Métrica: "Total de arremessos", Valor: stats.total },
    { Métrica: "Acertos", Valor: stats.acertos },
    { Métrica: "Aproveitamento", Valor: pct(stats.aproveitamento, 1) },
    { Métrica: "eFG%", Valor: pct(stats.efg, 1) },
    { Métrica: "PPS", Valor: stats.pps.toFixed(2) },
    { Métrica: "Sequência máxima", Valor: stats.sequenciaMaxima },
    { Métrica: "Sequência atual", Valor: stats.sequenciaAtual },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumo), "Resumo");

  const porZonaLinhas = ZONAS.map((z) => ({
    Zona: z,
    Tentativas: porZona[z].tentativas,
    Acertos: porZona[z].acertos,
    "Aproveitamento %": porZona[z].tentativas ? Number((porZona[z].aproveitamento * 100).toFixed(1)) : "",
    PPS: porZona[z].tentativas ? Number(porZona[z].pps.toFixed(2)) : "",
    "Referência base %": Number((ZONA_REFERENCIA[z] * 100).toFixed(0)),
    "Gap p.p.": porZona[z].gap !== null ? Number((porZona[z].gap * 100).toFixed(1)) : "",
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(porZonaLinhas), "Por Zona");

  const logLinhas = [...arremessosAtleta]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((a) => ({
      "Data/Hora": formatarDataHora(a.timestamp),
      "Minuto da sessão": a.minutoDaSessao,
      Zona: a.zona,
      Resultado: a.acertou ? "Acerto" : "Erro",
      Pontos: a.pontos,
      Drill: a.drillId || "",
    }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logLinhas), "Log de Arremessos");

  const sessoesLinhas = sessoesAtleta.map((s, i) => {
    const shots = arremessosAtleta.filter((a) => a.sessionId === s.id);
    const st = computarEstatisticas(shots);
    const duracaoMin = ((s.fim || Date.now()) - s.inicio) / 60000;
    return {
      Sessão: `S${i + 1}`,
      Início: formatarDataHora(s.inicio),
      Fim: s.fim ? formatarDataHora(s.fim) : "em andamento",
      "Duração (min)": duracaoMin.toFixed(1),
      Arremessos: st.total,
      "Aproveitamento %": st.total ? Number((st.aproveitamento * 100).toFixed(1)) : "",
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sessoesLinhas), "Sessões");

  const drillLinhas = drillRecordsAtleta.map((r) => ({
    Data: formatarDataHora(r.data),
    Treino: r.drillNome,
    "Acertos/Tentativas": `${r.totalAcertos}/${r.totalTentativas}`,
    Pontuação: r.pontuacao,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(drillLinhas.length ? drillLinhas : [{ Data: "", Treino: "", "Acertos/Tentativas": "", Pontuação: "" }]), "Drills");

  XLSX.writeFile(wb, `arremessos_${(atleta?.nome || "atleta").replace(/\s+/g, "_")}.xlsx`);
}

function exportarBackupJSON(estado) {
  const payload = { versao: 1, exportadoEm: new Date().toISOString(), ...estado };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup_arremessos_${dateKey(Date.now())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Tela: Atletas e configurações                                      */
/* ------------------------------------------------------------------ */
function TelaAtletas({
  atletas,
  atletaAtualId,
  setAtletaAtualId,
  onAdicionarAtleta,
  onRemoverAtleta,
  atleta,
  arremessosAtleta,
  sessoesAtleta,
  drillRecordsAtleta,
  onExportarPDF,
  onRestaurarBackup,
  onExportarBackup,
  onApagarTudo,
}) {
  const [novoNome, setNovoNome] = useState("");
  const inputRef = useRef(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Cartao>
        <Titulo>Atletas</Titulo>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
          {atletas.map((a) => (
            <div
              key={a.id}
              onClick={() => setAtletaAtualId(a.id)}
              className="bb-touch"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: 10,
                cursor: "pointer",
                background: a.id === atletaAtualId ? "rgba(37,99,235,0.2)" : COR.fundoCard2,
                border: a.id === atletaAtualId ? `1px solid ${COR.azul}` : `1px solid transparent`,
              }}
            >
              <span style={{ fontFamily: FONTE_TEXTO, fontSize: 14, color: COR.texto, fontWeight: a.id === atletaAtualId ? 600 : 400 }}>{a.nome}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {a.id === atletaAtualId && <Check size={16} color={COR.azulClaro} />}
                {atletas.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoverAtleta(a.id);
                    }}
                    aria-label="Remover atleta"
                    style={{ background: "none", border: "none", color: COR.textoMuted, minHeight: 44, minWidth: 44, cursor: "pointer" }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            ref={inputRef}
            placeholder="Nome do novo atleta"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: 8,
              border: `1px solid ${COR.borda}`,
              background: COR.fundoCard2,
              color: COR.texto,
              fontFamily: FONTE_TEXTO,
              fontSize: 14,
              padding: "0 10px",
            }}
          />
          <Botao
            variante="primario"
            icone={UserPlus}
            onClick={() => {
              if (!novoNome.trim()) return;
              onAdicionarAtleta(novoNome.trim());
              setNovoNome("");
            }}
          >
            Adicionar
          </Botao>
        </div>
      </Cartao>

      <Cartao>
        <Titulo>Exportar e backup</Titulo>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Botao variante="fantasma" icone={FileText} onClick={onExportarPDF}>
            Exportar PDF (janela de impressão)
          </Botao>
          <Botao
            variante="fantasma"
            icone={FileSpreadsheet}
            onClick={() => exportarExcel({ atleta, arremessosAtleta, sessoesAtleta, drillRecordsAtleta })}
          >
            Exportar Excel (.xlsx)
          </Botao>
          <Botao variante="fantasma" icone={Download} onClick={onExportarBackup}>
            Exportar backup (.json)
          </Botao>
          <label className="bb-touch" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, borderRadius: 10, border: `1px solid ${COR.borda}`, color: COR.texto, fontFamily: FONTE_TEXTO, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            <Upload size={17} />
            Restaurar backup (.json)
            <input
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onRestaurarBackup(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </Cartao>

      <Cartao style={{ borderColor: COR.vermelho }}>
        <Titulo style={{ color: COR.vermelho }}>Zona de risco</Titulo>
        <p style={{ fontFamily: FONTE_TEXTO, fontSize: 12, color: COR.textoMuted, marginBottom: 10 }}>
          Apaga todos os atletas, arremessos, sessões e treinos salvos neste dispositivo. Exporte um backup antes, se quiser manter os dados.
        </p>
        <Botao
          variante="perigo"
          icone={AlertTriangle}
          onClick={() => {
            if (window.confirm("Apagar todos os dados salvos? Essa ação não pode ser desfeita.")) onApagarTudo();
          }}
        >
          Apagar todos os dados
        </Botao>
      </Cartao>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Barra de abas inferior                                             */
/* ------------------------------------------------------------------ */
const ABAS = [
  { id: "registrar", nome: "Registrar", icone: Target },
  { id: "treinos", nome: "Treinos", icone: Dumbbell },
  { id: "analise", nome: "Análise", icone: BarChart3 },
  { id: "atletas", nome: "Atletas", icone: Users },
];

function BarraAbas({ abaAtiva, setAbaAtiva }) {
  return (
    <nav
      className="bb-ocultar-impressao"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        background: COR.fundoCard,
        borderTop: `1px solid ${COR.borda}`,
        zIndex: 30,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {ABAS.map((aba) => {
        const Icone = aba.icone;
        const ativa = abaAtiva === aba.id;
        return (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className="bb-touch"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              minHeight: 56,
              background: "none",
              border: "none",
              color: ativa ? COR.azulClaro : COR.textoMuted,
              cursor: "pointer",
            }}
          >
            <Icone size={20} />
            <span style={{ fontFamily: FONTE_TEXTO, fontSize: 10, fontWeight: 600 }}>{aba.nome}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */
export default function ShotTracker() {
  useFontes();

  const [carregado, setCarregado] = useState(false);
  const [atletas, setAtletas] = useState([]);
  const [atletaAtualId, setAtletaAtualId] = useState(null);
  const [arremessos, setArremessos] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [drillRecords, setDrillRecords] = useState([]);
  const [personalRecords, setPersonalRecords] = useState({});
  const [customDrills, setCustomDrills] = useState([]);

  const [abaAtiva, setAbaAtiva] = useState("registrar");
  const [mostrarCalor, setMostrarCalor] = useState(true);
  const [modoCalor, setModoCalor] = useState("pct");
  const [drillAtivo, setDrillAtivo] = useState(null);
  const [ultimoResultadoDrill, setUltimoResultadoDrill] = useState("acerto");
  const [agora, setAgora] = useState(Date.now());

  /* -------------------- carregamento inicial -------------------- */
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const [a, arr, ses, dr, pr, cd, atAtual] = await Promise.all([
        storageGet(CHAVES.atletas, null),
        storageGet(CHAVES.arremessos, []),
        storageGet(CHAVES.sessoes, []),
        storageGet(CHAVES.drillRecords, []),
        storageGet(CHAVES.recordes, {}),
        storageGet(CHAVES.drillsCustom, []),
        storageGet(CHAVES.atletaAtual, null),
      ]);
      if (cancelado) return;
      const atletasIniciais = a && a.length ? a : [{ id: uid(), nome: "Atleta 1", criadoEm: Date.now() }];
      setAtletas(atletasIniciais);
      setAtletaAtualId(atAtual && atletasIniciais.some((x) => x.id === atAtual) ? atAtual : atletasIniciais[0].id);
      setArremessos(arr || []);
      setSessoes(ses || []);
      setDrillRecords(dr || []);
      setPersonalRecords(pr || {});
      setCustomDrills(cd || []);
      setCarregado(true);
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  /* -------------------- autosave (debounced) -------------------- */
  const salvarTimeout = useRef(null);
  useEffect(() => {
    if (!carregado) return;
    if (salvarTimeout.current) clearTimeout(salvarTimeout.current);
    salvarTimeout.current = setTimeout(() => {
      storageSet(CHAVES.atletas, atletas);
      storageSet(CHAVES.arremessos, arremessos);
      storageSet(CHAVES.sessoes, sessoes);
      storageSet(CHAVES.drillRecords, drillRecords);
      storageSet(CHAVES.recordes, personalRecords);
      storageSet(CHAVES.drillsCustom, customDrills);
      storageSet(CHAVES.atletaAtual, atletaAtualId);
    }, 400);
    return () => clearTimeout(salvarTimeout.current);
  }, [carregado, atletas, arremessos, sessoes, drillRecords, personalRecords, customDrills, atletaAtualId]);

  /* -------------------- cronômetro da sessão -------------------- */
  const sessaoAtiva = useMemo(
    () => sessoes.find((s) => s.athleteId === atletaAtualId && s.fim === null),
    [sessoes, atletaAtualId]
  );
  useEffect(() => {
    if (!sessaoAtiva) return;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [sessaoAtiva]);
  const cronometroSeg = sessaoAtiva ? Math.floor((agora - sessaoAtiva.inicio) / 1000) : 0;

  /* -------------------- ref sempre atualizada do drill ativo -------------------- */
  const drillAtivoRef = useRef(null);
  useEffect(() => {
    drillAtivoRef.current = drillAtivo;
  }, [drillAtivo]);

  /* -------------------- descanso do drill -------------------- */
  useEffect(() => {
    if (!drillAtivo || drillAtivo.fase !== "descanso") return;
    if (drillAtivo.descansoRestante <= 0) {
      avancarBloco();
      return;
    }
    const t = setTimeout(() => {
      setDrillAtivo((d) => (d ? { ...d, descansoRestante: d.descansoRestante - 1 } : d));
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drillAtivo]);

  const atletaAtual = atletas.find((a) => a.id === atletaAtualId) || null;
  const arremessosAtleta = useMemo(() => arremessos.filter((a) => a.athleteId === atletaAtualId), [arremessos, atletaAtualId]);
  const sessoesAtleta = useMemo(() => sessoes.filter((s) => s.athleteId === atletaAtualId), [sessoes, atletaAtualId]);
  const drillRecordsAtleta = useMemo(() => drillRecords.filter((d) => d.athleteId === atletaAtualId), [drillRecords, atletaAtualId]);

  const drillsDisponiveis = useMemo(() => [...DRILLS_BASE, ...customDrills], [customDrills]);

  /* -------------------- sessão -------------------- */
  function garantirSessaoAtiva() {
    const existente = sessoes.find((s) => s.athleteId === atletaAtualId && s.fim === null);
    if (existente) return existente;
    const nova = { id: uid(), athleteId: atletaAtualId, inicio: Date.now(), fim: null };
    setSessoes((prev) => [...prev, nova]);
    return nova;
  }

  function iniciarSessao() {
    garantirSessaoAtiva();
  }

  function finalizarSessao() {
    setSessoes((prev) => prev.map((s) => (s.athleteId === atletaAtualId && s.fim === null ? { ...s, fim: Date.now() } : s)));
  }

  /* -------------------- registro de arremessos -------------------- */
  const sessaoRef = useRef(null);
  sessaoRef.current = sessaoAtiva;

  function registrarArremesso(x, y, acertou, drillId = null) {
    const sessao = sessaoRef.current || garantirSessaoAtiva();
    const zona = classificarZona(x, y);
    const novo = {
      id: uid(),
      timestamp: Date.now(),
      minutoDaSessao: Math.max(0, Math.floor((Date.now() - sessao.inicio) / 60000)),
      zona,
      x,
      y,
      acertou,
      drillId,
      pontos: ZONA_PONTOS[zona],
      athleteId: atletaAtualId,
      sessionId: sessao.id,
    };
    setArremessos((prev) => [...prev, novo]);
    return novo;
  }

  function desfazerUltimo() {
    setArremessos((prev) => {
      const doAtleta = prev.filter((a) => a.athleteId === atletaAtualId);
      if (!doAtleta.length) return prev;
      const ultimo = [...doAtleta].sort((a, b) => b.timestamp - a.timestamp)[0];
      return prev.filter((a) => a.id !== ultimo.id);
    });
  }

  function removerArremesso(id) {
    setArremessos((prev) => prev.filter((a) => a.id !== id));
  }

  /* -------------------- motor de treinos guiados -------------------- */
  function iniciarDrill(drill) {
    garantirSessaoAtiva();
    setDrillAtivo({
      drill,
      blocoIndex: 0,
      tentativas: 0,
      acertos: 0,
      fase: "ativo",
      descansoRestante: 0,
      blocosResultado: [],
      recordeSuperado: false,
    });
  }

  function finalizarDrill(d) {
    const totalTentativas = d.blocosResultado.reduce((s, b) => s + b.tentativas, 0);
    const totalAcertos = d.blocosResultado.reduce((s, b) => s + b.acertos, 0);
    const pontuacao = d.blocosResultado.reduce((s, b) => s + b.acertos * (ZONA_PONTOS[b.zona] || 2), 0);

    const recordeAtual = personalRecords[atletaAtualId]?.[d.drill.id];
    const superouRecorde = !recordeAtual || totalAcertos > recordeAtual.melhorAcertos;

    if (superouRecorde) {
      setPersonalRecords((prev) => ({
        ...prev,
        [atletaAtualId]: {
          ...(prev[atletaAtualId] || {}),
          [d.drill.id]: { melhorAcertos: totalAcertos, melhorTentativas: totalTentativas, melhorPontuacao: pontuacao, data: Date.now() },
        },
      }));
    }

    setDrillRecords((prev) => [
      ...prev,
      {
        id: uid(),
        athleteId: atletaAtualId,
        drillId: d.drill.id,
        drillNome: d.drill.nome,
        data: Date.now(),
        blocos: d.blocosResultado,
        totalAcertos,
        totalTentativas,
        pontuacao,
      },
    ]);

    setDrillAtivo({ ...d, fase: "fim", recordeSuperado: superouRecorde });
  }

  function avancarBloco() {
    const d = drillAtivoRef.current;
    if (!d) return;
    const proximoIndex = d.blocoIndex + 1;
    if (proximoIndex >= d.drill.blocos.length) {
      finalizarDrill(d);
      return;
    }
    setDrillAtivo({ ...d, blocoIndex: proximoIndex, tentativas: 0, acertos: 0, fase: "ativo", descansoRestante: 0 });
  }

  function tocarQuadraDrill(x, y, acertou) {
    const d = drillAtivoRef.current;
    if (!d) return;
    registrarArremesso(x, y, acertou, d.drill.id);
    const tentativas = d.tentativas + 1;
    const acertosNovo = d.acertos + (acertou ? 1 : 0);
    const blocoAtual = d.drill.blocos[d.blocoIndex];
    if (tentativas >= blocoAtual.repeticoes) {
      const blocosResultado = [...d.blocosResultado, { zona: blocoAtual.zona, tentativas, acertos: acertosNovo }];
      const ehUltimoBloco = d.blocoIndex + 1 >= d.drill.blocos.length;
      if (ehUltimoBloco) {
        finalizarDrill({ ...d, blocosResultado });
        return;
      }
      if (d.drill.descansoBlocoSeg > 0) {
        setDrillAtivo({ ...d, tentativas, acertos: acertosNovo, blocosResultado, fase: "descanso", descansoRestante: d.drill.descansoBlocoSeg });
      } else {
        setDrillAtivo({ ...d, blocoIndex: d.blocoIndex + 1, tentativas: 0, acertos: 0, blocosResultado, fase: "ativo" });
      }
      return;
    }
    setDrillAtivo({ ...d, tentativas, acertos: acertosNovo });
  }

  function pularDescanso() {
    avancarBloco();
  }

  function salvarDrillCustom(drill) {
    setCustomDrills((prev) => [...prev, drill]);
  }

  /* -------------------- atletas -------------------- */
  function adicionarAtleta(nome) {
    const novo = { id: uid(), nome, criadoEm: Date.now() };
    setAtletas((prev) => [...prev, novo]);
    setAtletaAtualId(novo.id);
  }

  function removerAtleta(id) {
    setAtletas((prev) => {
      const restante = prev.filter((a) => a.id !== id);
      if (atletaAtualId === id && restante.length) setAtletaAtualId(restante[0].id);
      return restante;
    });
  }

  /* -------------------- exportação -------------------- */
  function exportarPDF() {
    if (typeof window !== "undefined") window.print();
  }

  function exportarBackup() {
    exportarBackupJSON({ atletas, arremessos, sessoes, drillRecords, personalRecords, customDrills });
  }

  async function apagarTudo() {
    const chaves = await storageList();
    const chavesDoApp = new Set([...Object.values(CHAVES), ...chaves.filter((c) => c.startsWith("bb_"))]);
    await Promise.all([...chavesDoApp].map((c) => storageDelete(c)));
    const novoAtleta = { id: uid(), nome: "Atleta 1", criadoEm: Date.now() };
    setAtletas([novoAtleta]);
    setAtletaAtualId(novoAtleta.id);
    setArremessos([]);
    setSessoes([]);
    setDrillRecords([]);
    setPersonalRecords({});
    setCustomDrills([]);
    setDrillAtivo(null);
  }

  function restaurarBackup(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dados = JSON.parse(String(reader.result));
        if (Array.isArray(dados.atletas)) setAtletas(dados.atletas);
        if (Array.isArray(dados.arremessos)) setArremessos(dados.arremessos);
        if (Array.isArray(dados.sessoes)) setSessoes(dados.sessoes);
        if (Array.isArray(dados.drillRecords)) setDrillRecords(dados.drillRecords);
        if (dados.personalRecords) setPersonalRecords(dados.personalRecords);
        if (Array.isArray(dados.customDrills)) setCustomDrills(dados.customDrills);
        if (Array.isArray(dados.atletas) && dados.atletas.length) setAtletaAtualId(dados.atletas[0].id);
      } catch {
        alert("Arquivo de backup inválido.");
      }
    };
    reader.readAsText(file);
  }

  if (!carregado) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COR.fundo }}>
        <span style={{ fontFamily: FONTE_TEXTO, color: COR.textoMuted }}>Carregando…</span>
      </div>
    );
  }

  return (
    <div
      className="bb-app"
      style={{
        minHeight: "100vh",
        background: COR.fundo,
        color: COR.texto,
        fontFamily: FONTE_TEXTO,
        paddingBottom: 76,
      }}
    >
      <style>{`
        .bb-touch { -webkit-tap-highlight-color: transparent; }
        @media print {
          .bb-ocultar-impressao { display: none !important; }
          .bb-app { background: #ffffff !important; color: #0b0b0b !important; padding-bottom: 0 !important; }
          .bb-app svg text { fill: #0b0b0b !important; }
        }
      `}</style>

      <header className="bb-ocultar-impressao" style={{ padding: "16px 16px 8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 20, letterSpacing: 0.5 }}>ARREMESSOS</div>
          <div style={{ fontFamily: FONTE_TEXTO, fontSize: 12, color: COR.textoMuted }}>{atletaAtual?.nome}</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <NumeroPlacar valor={computarEstatisticas(arremessosAtleta).sequenciaMaxima} rotulo="Recorde" cor={COR.ambar} tamanho={24} />
        </div>
      </header>

      <main style={{ padding: "8px 16px 16px 16px", maxWidth: 640, margin: "0 auto" }}>
        {abaAtiva === "registrar" && (
          <TelaRegistro
            arremessosAtleta={arremessosAtleta}
            sessaoAtiva={sessaoAtiva}
            cronometroSeg={cronometroSeg}
            onIniciarSessao={iniciarSessao}
            onFinalizarSessao={finalizarSessao}
            onRegistrarArremesso={(x, y, acertou) => registrarArremesso(x, y, acertou, null)}
            onDesfazer={desfazerUltimo}
            onRemoverArremesso={removerArremesso}
            mostrarCalor={mostrarCalor}
            setMostrarCalor={setMostrarCalor}
            modoCalor={modoCalor}
            setModoCalor={setModoCalor}
          />
        )}
        {abaAtiva === "treinos" && (
          <TelaTreinos
            drillsDisponiveis={drillsDisponiveis}
            drillAtivo={drillAtivo}
            personalRecords={personalRecords}
            atletaId={atletaAtualId}
            onIniciarDrill={iniciarDrill}
            onTocarQuadraDrill={tocarQuadraDrill}
            onPularDescanso={pularDescanso}
            onEncerrarDrill={() => setDrillAtivo(null)}
            onSalvarDrillCustom={salvarDrillCustom}
            ultimoResultado={ultimoResultadoDrill}
            setUltimoResultado={setUltimoResultadoDrill}
          />
        )}
        {abaAtiva === "analise" && <TelaAnalise atleta={atletaAtual} arremessosAtleta={arremessosAtleta} sessoesAtleta={sessoesAtleta} />}
        {abaAtiva === "atletas" && (
          <TelaAtletas
            atletas={atletas}
            atletaAtualId={atletaAtualId}
            setAtletaAtualId={setAtletaAtualId}
            onAdicionarAtleta={adicionarAtleta}
            onRemoverAtleta={removerAtleta}
            atleta={atletaAtual}
            arremessosAtleta={arremessosAtleta}
            sessoesAtleta={sessoesAtleta}
            drillRecordsAtleta={drillRecordsAtleta}
            onExportarPDF={exportarPDF}
            onExportarBackup={exportarBackup}
            onRestaurarBackup={restaurarBackup}
            onApagarTudo={apagarTudo}
          />
        )}
      </main>

      <BarraAbas abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
    </div>
  );
}
