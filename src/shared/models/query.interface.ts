export interface Query {
    symbol: string;
    to: string;
    from: string;
    rate?: number;
    input?: any;
    modelName?: string;
}