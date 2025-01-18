export interface Score {
    symbol?: string;
    algorithm?: string;
    guesses: number;
    correct: number;
    score: number;
    nextOutput?: number;
    predictionHistory?: PredictionHistory[];
}

export interface PredictionHistory {
    date: string;
    prediction: number;
    actual: number;
}