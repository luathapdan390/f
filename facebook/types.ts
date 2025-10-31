export interface FacebookMindsetShift {
  beliefReframing: {
    certainty: string;
    variety: string;
    significance: string;
    connection: string;
    growth: string;
    contribution: string;
  };
  resourceReframing: {
    certainty: string;
    variety: string;
    significance: string;
    connection: string;
    growth: string;
    contribution: string;
  };
  contentIdeas: string[];
}

// FIX: Added the missing 'Evaluation' interface, which is used by the EvaluationDisplay component.
export interface Evaluation {
  bandScore: number;
  strengths: string[];
  improvements: string[];
  highBandAnswer: string;
}
