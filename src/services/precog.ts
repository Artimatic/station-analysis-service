import { Graph, Mat, InnerState, RNN } from "recurrent-js";

class Precog {
    constructor() { }

    public train(): void {

        // const test = [
        //     0,
        //     Math.sin(3.14 / 2),
        //     Math.sin(3.14 / 2),
        //     Math.sin(3.14 / 2),
        //     Math.sin(3.14 / 2),
        //     Math.sin(3.14 / 2),

        // ];

        // define network structure
        const netOpts = {
            inputSize: 3,
            hiddenUnits: [ 6, 2, 6 ],
            outputSize: 4
          };

        const net = new RNN(netOpts);

        // instantiate a graph with backprop-ability
        const graph = new Graph(true);

        let decision = undefined,
            previousDecision = undefined;

        for (let i = 0, end = test.length; i < end; i++) {
            previousDecision = decision;
            /*
            1. Before forward pass:
            Create a single row of type `Mat`, which holds an observation.
            We will refer to this as the state.
            Dimensions of state are according to the configuration of the net (rows = inputSize = 3, cols = 1).
            */
            const observation = [1, 0, 1]; /* an observation (ideally normalized) */
            const state = new Mat(3, 1);
            state.setFrom(observation);

            /*
            2. Decision making:
            Forward pass with observed state of type `Mat` and graph.
            The resulting decision is of type `Mat` and is holding multiple output values (here: 4).
            */
            decision = net.forward(state, previousDecision, graph);

            /*
            3. After forward pass:
            Compute the decision errors.
            We refer to this as the loss value(s).
            Inject that loss value into the derivative of your targeted value.
            Here you could also apply e.g. loss clipping before injecting the value.
            NOTE: You can also apply multiple loss values, to the respective array fields.
            */
            // decision.output.dw[1] = 0.5;
            console.log("loss value: ", decision.output.dw[1]);
            /*
            4. After injecting the loss value:
            since graph is keeping a reference of `decision`, it can now perform the backpropagation and therefore adjust the decisions gradient.
            */
            graph.backward();

            /* REPEAT numbers 1 to 5 till the loss value(s) reach a certain threshold */
        }
    }
}

export default new Precog();
