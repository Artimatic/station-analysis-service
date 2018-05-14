import * as neataptic from 'neataptic';

const network = new neataptic.architect.LSTM(1, 12, 1);;

class Precog {
    previous: any;
    trainingData: any[] = [];
    constructor() { }

    public run(): any {
        let prediction;
        let counter = {heads: 0, tails: 0, guesses: 0, correct: 0};
        for(let i = 0; i < 1000; i++) {
            let coinSide = this.flip();
            if(prediction !== undefined) {
                counter.guesses++;
                if(coinSide === prediction) {
                    counter.correct++;
                }
            }

            if(coinSide) {
                counter.heads++;
            } else {
                counter.tails++;
            }
            prediction = this.addSet(coinSide);
        }
        console.log(`heads: ${counter.heads}, 
        tails: ${counter.tails}, 
        correct: ${counter.guesses},
        guesses: ${counter.correct},
        ratio: ${counter.correct/counter.guesses}`);
    }

    private flip(): number {
        return Math.round(Math.random());
    } 

    private predict() {
        let output;
        // Iterate over previous sets to get into the 'flow'
        for (var i in this.trainingData) {
            let input = this.trainingData[i].input;
            output = Math.round(network.activate([input]));
        }

        // Activate network with previous output
        const input = output;
        return Math.round(network.activate([input]))
    }

    private addSet(side: any): any {
        let predicted;
        if (this.previous != null) {
            this.trainingData.push({ input: [this.previous], output: [side] });
            this.train();
            predicted = this.predict();
        }

        this.previous = side;
        return predicted;
    }

    private train() {
        // Train the network, setting clue to true is the key to the solution
        network.train(this.trainingData, {
            log: 0,
            iterations: 5000,
            error: 0.03,
            clear: true,
            rate: 0.05,
        });
    }
}

export default new Precog();
