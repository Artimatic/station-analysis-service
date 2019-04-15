import * as neataptic from 'neataptic';
import brain from 'brain.js';
import { TrainingData } from '../shared/models/training-data.interface';
import { Score } from '../shared/models/score.interface';
import { NetworkOptions } from '../shared/models/network-options.interface';

const network = new neataptic.architect.LSTM(5, 8, 1);
const lstm = new brain.recurrent.LSTM();

const defaultOptions: NetworkOptions = {
    log: 10000,
    iterations: 10000,
    error: 0.08,
    clear: true,
    rate: 0.01
};

class Precog {
    previous: any;
    trainingData: any[] = [];
    constructor() { }


    public testLstm(trainingData: TrainingData[], options = defaultOptions): any {
        const trainingSet = trainingData.slice(0, trainingData.length - 2);

        console.log('Network settings: ', options);
        console.log('Training data size: ', trainingData.length);

        network.train(trainingSet, options);
        return this.score(trainingData.slice(Math.floor(trainingData.length / 2), trainingData.length), false);
    }

    public testBrainLstm(trainingData: TrainingData[], options = defaultOptions): any {
        const trainingSet = trainingData.slice(0, trainingData.length / 2);

        console.log('Training data size: ', trainingData.length);

        const result = lstm.train(trainingSet, { iterations: 1500 });

        return this.score(trainingData.slice(Math.floor(trainingData.length / 2), trainingData.length), true);
    }

    private score(scoringSet: TrainingData[], brain: boolean) {
        const scorekeeper: Score = { guesses: 0, correct: 0, score: 0 };

        for (let i = 0; i < scoringSet.length; i++) {
            if (scoringSet[i]) {
                const actual = scoringSet[i].output;
                const input = scoringSet[i].input;
                if (input) {
                    const rawPrediction = brain ? lstm.run(input) : network.activate(input);
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
            output = Math.round(network.activate([input]));
        }

        // Activate network with previous output
        const input = output;
        return Math.round(network.activate([input]));
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
        // 71140000
        // Train the network, setting clue to true is the key to the solution
        network.train(this.trainingData, {
            log: 5000,
            iterations: 10000,
            rate: 0.1,
            error: 0.025,
            clear: true
        });
    }
}

export default new Precog();
