export interface Philosopher {
  id: string;
  name: string;
  originalName?: string;
  birthDeath: string;
  born: number | string; // Numeric year or complex string
  died: number | string;
  epoch: string; // antika, srednji_vijek, moderno, suvremeno
  shortBio: string;
  keyIdeas: string[];
  wikiUrl?: string;
}

export interface Connection {
  source: string;
  target: string;
  description: string;
}

export interface Epoch {
  id: string;
  name: string;
  period: string;
  color: {
    bg: string;
    text: string;
    border: string;
    hex: string; // Hex for canvas/custom styling
    hoverHex: string;
  };
}
