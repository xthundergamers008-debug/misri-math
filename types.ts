export interface MathStep {
  title: string;
  description: string;
  latex?: string;
}

export interface MathSolution {
  id: string;
  originalProblem: string;
  finalAnswer: string;
  steps: MathStep[];
  graphExpression?: string; // e.g., "x^2 + 2x" for plotting
  category: 'Arithmetic' | 'Algebra' | 'Geometry' | 'Calculus' | 'Other';
  timestamp: number;
}

export enum InputMode {
  CAMERA = 'camera',
  DRAW = 'draw',
  TEXT = 'text',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
