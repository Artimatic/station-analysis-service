import * as neataptic from 'neataptic';
import { TrainingData } from '../shared/models/training-data.interface';
import { Score } from '../shared/models/score.interface';
import { NetworkOptions } from '../shared/models/network-options.interface';
import * as _ from 'lodash';

const defaultOptions: NetworkOptions = {
    log: 10000,
    iterations: 10000,
    error: 0.08,
    clear: true,
    rate: 0.01,
    trainingSize: 0.7
};

class Precog {
    network = new neataptic.architect.LSTM(5, 6, 1);
    previous: any;
    trainingData: any[] = [];
    constructor() { }

    public activate(input, round: boolean): Score {
        const scorekeeper: Score = { guesses: 0, correct: 0, score: 0};

        const result = this.network.activate(input);
        if (round) {
            scorekeeper.nextOutput = _.round(result);
        } else {
            console.log('result: ', result);
            scorekeeper.nextOutput = _.round(result, 2);
        }

        return scorekeeper;
    }

    public testLstm(trainingData: TrainingData[], options = defaultOptions): any {
        const trainingSet = trainingData.slice(0, Math.floor((options.trainingSize || 0.7) * trainingData.length));

        console.log('Network settings: ', options);
        console.log('Training data size: ', trainingData.length);

        this.network.train(trainingSet, options);
        return this.score(trainingData.slice(Math.floor(options.trainingSize / 100 * trainingData.length), trainingData.length));
    }

    private score(scoringSet: TrainingData[]) {
        const scorekeeper: Score = { guesses: 0, correct: 0, score: 0 };

        for (let i = 0; i < scoringSet.length; i++) {
            if (scoringSet[i]) {
                const actual = scoringSet[i].output;
                const input = scoringSet[i].input;
                if (input) {
                    const rawPrediction =  this.network.activate(input);
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

    private roundPrediction(x: number, y: number): number[] {
        return [Math.round(x), Math.round(y)];
    }

    public run(): any {
        let prediction;
        const score = { heads: 0, tails: 0, guesses: 0, correct: 0 };
        for (let i = 0; i < 1000; i++) {
            const coinSide = this.flip();
            if (prediction !== undefined) {
                console.log(`coin flip: ${coinSide}, prediction: ${prediction}`);

                score.guesses++;
                if (coinSide === prediction) {
                    score.correct++;
                }
            }

            if (coinSide) {
                score.heads++;
            } else {
                score.tails++;
            }
            prediction = this.addSet(coinSide);
        }
        console.log(`heads: ${score.heads},
        tails: ${score.tails},
        correct: ${score.correct},
        guesses: ${score.guesses},
        ratio: ${score.correct / score.guesses}`);
    }

    private flip(): number {
        return Math.round(Math.random());
    }

    private predict() {
        let output;
        // Iterate over previous sets to get into the 'flow'
        for (const i in this.trainingData) {
            const input = this.trainingData[i].input;
            output = Math.round(this.network.activate([input]));
        }

        // Activate network with previous output
        const input = output;
        return Math.round(this.network.activate([input]));
    }

    private addSet(side: any): any {
        let predicted;
        if (this.previous != undefined) {
            this.trainingData.push({ input: [this.previous], output: [side] });
            this.train();
            predicted = this.predict();
        }

        this.previous = side;
        return predicted;
    }

    private train() {
        this.network.train(this.trainingData, {
            log: 5000,
            iterations: 10000,
            rate: 0.1,
            error: 0.025,
            clear: true
        });
    }
}

export default new Precog();
