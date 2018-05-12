import * as brain from 'brain.js';

class Precog {
    constructor() { }

    public train(): any {
        // fibonacci
        const fibonacci = [
            { input: [1], output: [1] },
            { input: [2], output: [1] }
        ];

        for (let i = 2; i <= 50; i++) {
            const tmp = fibonacci.slice(-2);

            fibonacci.push({ input: [i], output: [(tmp[0].output[0] + tmp[1].output[0])] });
        }

        const net = new brain.recurrent.LSTM();

        net.train(fibonacci.slice(0, -1), {
            errorThresh: 0.005,  // error threshold to reach
            iterations: 200,   // maximum training iterations
            log: true,           // console.log() progress periodically
            logPeriod: 10,       // number of iterations between logging
            learningRate: 0.3    // learning rate
        });

        console.log(fibonacci);

        return net.run([51]);
    }
}

export default new Precog();
