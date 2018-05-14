"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const neataptic = __importStar(require("neataptic"));
const network = new neataptic.architect.LSTM(1, 12, 1);
;
class Precog {
    constructor() {
        this.trainingData = [];
    }
    run() {
        let prediction;
        let counter = { heads: 0, tails: 0, guesses: 0, correct: 0 };
        for (let i = 0; i < 1000; i++) {
            let coinSide = this.flip();
            if (prediction !== undefined) {
                counter.guesses++;
                if (coinSide === prediction) {
                    counter.correct++;
                }
            }
            if (coinSide) {
                counter.heads++;
            }
            else {
                counter.tails++;
            }
            prediction = this.addSet(coinSide);
        }
        console.log(`heads: ${counter.heads}, 
        tails: ${counter.tails}, 
        correct: ${counter.guesses},
        guesses: ${counter.correct},
        ratio: ${counter.correct / counter.guesses}`);
    }
    flip() {
        return Math.round(Math.random());
    }
    predict() {
        let output;
        // Iterate over previous sets to get into the 'flow'
        for (var i in this.trainingData) {
            let input = this.trainingData[i].input;
            output = Math.round(network.activate([input]));
        }
        // Activate network with previous output
        const input = output;
        return Math.round(network.activate([input]));
    }
    addSet(side) {
        let predicted;
        if (this.previous != null) {
            this.trainingData.push({ input: [this.previous], output: [side] });
            this.train();
            predicted = this.predict();
        }
        this.previous = side;
        return predicted;
    }
    train() {
        // Train the network, setting clue to true is the key to the solution
        network.train(this.trainingData, {
            log: 500,
            iterations: 5000,
            error: 0.03,
            clear: true,
            rate: 0.05,
        });
    }
}
exports.default = new Precog();
//# sourceMappingURL=precog.js.map