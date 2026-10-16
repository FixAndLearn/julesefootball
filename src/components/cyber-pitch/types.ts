export type SupportedLanguage = "en" | "sw" | "kam";

export type CardPosition =
  | "CF"
  | "SS"
  | "RWF"
  | "LWF"
  | "AMF"
  | "CMF"
  | "DMF"
  | "CB"
  | "LB"
  | "RB"
  | "GK";

export type CardTheme =
  | "cyber_neon"
  | "void_onyx"
  | "golden_legend"
  | "electric_pitch"
  | "crimson_velocity";

export type CardFinish =
  | "holographic"
  | "carbon"
  | "prismatic"
  | "gold_foil";

export type TacticalFormation =
  | "4-2-1-3"
  | "3-2-2-3"
  | "4-1-2-3"
  | "5-2-1-2"
  | "4-2-2-2"
  | "4-3-1-2";

export type Playstyle =
  | "Quick Counter"
  | "Possession Game"
  | "Out Wide"
  | "Long Ball Counter";

export interface CardAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface PlayerCardData {
  id: string;
  gamerHandle: string;
  teamName: string;
  position: CardPosition;
  ovr: number;
  cardTheme: CardTheme;
  cardFinish: CardFinish;
  attributes: CardAttributes;
  formation: TacticalFormation;
  playstyle: Playstyle;
  priceKes: number;
  category: "trending" | "formation" | "goalkeeper" | "legendary";
  imageUrl?: string;
  tacticalDescription?: string;
  isCustom?: boolean;
}

export type GalleryCategory =
  | "all"
  | "trending"
  | "formation"
  | "goalkeeper"
  | "legendary";

export interface FormationNode {
  role: CardPosition;
  x: number; // percentage from left
  y: number; // percentage from top
  label: string;
}

export interface FormationPreset {
  id: TacticalFormation;
  name: string;
  playstyle: Playstyle;
  metaTier: "S-Tier" | "A-Tier" | "Tournament Dominator";
  strengths: string[];
  nodes: FormationNode[];
  description: string;
}
