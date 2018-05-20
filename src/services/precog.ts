import * as neataptic from 'neataptic';
import { TrainingData } from '../shared/models/training-data.interface';

const network = new neataptic.architect.LSTM(5, 7, 1);

class Precog {
    previous: any;
    trainingData: any[] = [];
    constructor() { }


    public testLstm(trainingData: TrainingData[]): any {
        const smallSet = trainingData.slice(0, Math.floor(trainingData.length / 2));
        console.log('Training data size: ', trainingData.length);

        network.train(smallSet, {
            log: 5000,
            iterations: 80000,
            error: 0.03,
            clear: true,
            rate: 0.05,
        });
        return this.score(trainingData.slice(Math.floor(trainingData.length / 2), trainingData.length));
    }

    private score(trainingData: TrainingData[]): string {
        const score = { heads: 0, tails: 0, guesses: 0, correct: 0 };
        for (let i = 0; i < trainingData.length; i++) {
            if (trainingData[i]) {
                const actual = trainingData[i].output;
                const input = trainingData[i].input;
                if (actual && input) {
                    const prediction = Math.round(network.activate(input));

                    if (prediction !== undefined) {
                       // console.log(`actual: ${actual}, prediction: ${prediction}`);
                        score.guesses++;
                        if (actual[0] === prediction) {
                            score.correct++;
                        }
                    }

                    if (actual[0]) {
                        score.heads++;
                    } else {
                        score.tails++;
                    }
                }
            }
        }
        return `heads: ${score.heads}` +
            `tails: ${score.tails}` +
            `correct: ${score.correct}` +
            `guesses: ${score.guesses}` +
            `ratio: ${score.correct / score.guesses}`;
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
