export interface Score {
    symbol?: string;
    algorithm?: string;
    guesses: number;
    correct: number;
    score: number;
    nextOutput?: number;
}