"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const brain = __importStar(require("brain.js"));
class Precog {
    constructor() { }
    train() {
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
            errorThresh: 0.005,
            iterations: 200,
            log: true,
            logPeriod: 10,
            learningRate: 0.3 // learning rate
        });
        console.log(fibonacci);
        return net.run([51]);
    }
}
exports.default = new Precog();
//# sourceMappingURL=precog.js.map