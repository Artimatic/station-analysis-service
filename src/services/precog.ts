import * as neataptic from 'neataptic';
import { TrainingData } from '../shared/models/training-data.interface';
import { Score } from '../shared/models/score.interface';
import { NetworkOptions } from '../shared/models/network-options.interface';
import _ from 'lodash';

const defaultOptions: NetworkOptions = {
    log: 10000,
    iterations: 10000,
    error: 0.08,
    clear: true,
    rate: 0.01,
    trainingSize: 0.7
};

class Precog {
    v2Network = {};
    network = {};
    previous: any;
    trainingData: any[] = [];
    customNetworks = {};
    constructor() { }

    public activate(symbol: string, input, round: boolean, useV2Network = false): Score {
        const scorekeeper: Score = { guesses: 0, correct: 0, score: 0 };

        const result = useV2Network ? this.v2Network[symbol].activate(input) : this.network[symbol].activate(input);
        if (round) {
            scorekeeper.nextOutput = _.round(result);
        } else {
            console.log('result: ', result);
            scorekeeper.nextOutput = _.round(result, 2);
        }

        return scorekeeper;
    }

    public activateCustom(symbol: string, modelName: string, input, round: boolean): Score {
        const scorekeeper: Score = { guesses: 0, correct: 0, score: 0 };

        const result = this.customNetworks[modelName][symbol].activate(input);
        if (round) {
            scorekeeper.nextOutput = _.round(result);
        } else {
            console.log('result: ', result);
            scorekeeper.nextOutput = _.round(result, 2);
        }

        return scorekeeper;
    }


    public testLstm(symbol: string, trainingData: TrainingData[], options = defaultOptions): any {
        const trainingSet = trainingData.slice(0, Math.floor((options.trainingSize || 0.7) * trainingData.length));

        console.log('Network settings: ', options);
        console.log('Training data size: ', trainingData.length);

        this.network[symbol] = new neataptic.architect.LSTM(trainingData[0].input.length, 6, trainingData[0].output.length);
        this.network[symbol].train(trainingSet, options);
        return this.score(symbol,
            trainingData.slice(Math.floor(options.trainingSize / 100 * trainingData.length),
                trainingData.length),
            this.network[symbol]);
    }

    public testIntradayModels(symbol: string, modelName: string, trainingData: TrainingData[], options = defaultOptions): any {
        if (options.trainingSize) {
            const trainingSet = trainingData.slice(0, Math.floor((options.trainingSize) * trainingData.length));

            console.log('Network settings: ', options);
            console.log('Training data size: ', trainingData.length);

            if (!this.customNetworks[modelName]) {
                this.customNetworks[modelName] = {};
            }
            this.customNetworks[modelName][symbol] = new neataptic.architect.LSTM(trainingData[0].input.length, 6, trainingData[0].output.length);

            this.customNetworks[modelName][symbol].train(trainingSet, options);
            console.log('Created model for ', modelName + symbol);
        }

        return this.intradayScore(symbol, modelName,
            trainingData.slice(0,
                trainingData.length),
            this.customNetworks[modelName][symbol]);
    }

    public testLstmClosePrice(symbol: string, trainingData: TrainingData[], options = defaultOptions): any {
        const trainingSet = trainingData.slice(0, Math.floor((options.trainingSize || 0.7) * trainingData.length));

        console.log('Network settings: ', options);
        console.log('Training data size: ', trainingData.length);

        this.v2Network[symbol] = new neataptic.architect.LSTM(trainingData[0].input.length, 6, trainingData[0].output.length);
        this.v2Network[symbol].train(trainingSet, options);
        return this.score(symbol,
            trainingData.slice(Math.floor(options.trainingSize / 100 * trainingData.length),
                trainingData.length),
            this.v2Network[symbol]);
    }

    public hasCustomModel(symbol: string) {
        return Boolean(this.v2Network[symbol]);
    }

    public scoreCustomModel(symbol: string, trainingData: TrainingData[]) {
        return this.score(symbol,
            trainingData.slice(0,
                trainingData.length),
            this.v2Network[symbol]);
    }

    private score(symbol: string, scoringSet: TrainingData[], network) {
        const scorekeeper: Score = { guesses: 0, correct: 0, score: 0 };

        for (let i = 0; i < scoringSet.length; i++) {
            if (scoringSet[i]) {
                const actual = scoringSet[i].output;
                const input = scoringSet[i].input;
                if (input) {
                    const rawPrediction = network.activate(input);
                    const prediction = Math.round(rawPrediction);

                    if (actual && prediction !== undefined) {
                        if (i % 100 === 0) {
                            console.log(`${i}: actual: ${actual}, prediction: ${prediction}`);
                        }

                        scorekeeper.guesses++;
                        if (actual[0] === prediction) {
                            scorekeeper.correct++;
                        }
                    }

                    if (!actual) {
                        scorekeeper.nextOutput = prediction;
                        console.log(`prediction: ${prediction}`);
                    }
                }
            }
        }

        scorekeeper.score = scorekeeper.correct / scorekeeper.guesses;

        console.log('Score: ', scorekeeper);
        return scorekeeper;
    }

    private intradayScore(symbol: string, modelName: string, scoringSet: TrainingData[], network) {
        const scorekeeper: Score = { symbol, algorithm: modelName, guesses: 0, correct: 0, score: 0, predictionHistory: [] };
        for (let i = 0; i < scoringSet.length; i++) {
            if (scoringSet[i]) {
                const actual = scoringSet[i].output;
                const input = scoringSet[i].input;
                if (input) {
                    const rawPrediction = network.activate(input);
                    const prediction = _.round(rawPrediction[0]);
                    const rawPredictionRounded = _.round(rawPrediction[0], 3);

                    if (actual && prediction === 1 || i === scoringSet.length - 1) {
                        if (i % 100 === 0) {
                            console.log('Input: ', input);
                            console.log(`${i}: actual: ${actual}, prediction: ${rawPredictionRounded}`);
                        }

                        scorekeeper.guesses++;
                        if (actual) {
                            if (_.round(actual[0]) === prediction) {
                                scorekeeper.correct++;
                            }
                        } else {
                            console.log('actual: ', actual);
                        }
                    }

                    scorekeeper.nextOutput = rawPredictionRounded;
                    scorekeeper.predictionHistory.push({ date: scoringSet[i].date, prediction: rawPrediction[0] });
                }
            }
        }

        scorekeeper.score = scorekeeper.correct / scorekeeper.guesses;

        console.log(' - Score - ');
        console.log(`algorithm: ${scorekeeper.algorithm}, guesses: ${scorekeeper.guesses}, correct: ${scorekeeper.correct}, score: ${scorekeeper.score}`);
        return scorekeeper;
    }
}

export default new Precog();
