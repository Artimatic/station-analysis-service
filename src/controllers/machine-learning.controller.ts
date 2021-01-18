import { Response, Request } from 'express';
import configurations from '../configurations';
import request from 'request-promise';
import MachineLearningService from '../services/machine-learning.service';
import * as apiController from '../controllers/api';

export const trainModelV2 = async (req: Request, res: Response) => {
  const requestQuery: {
    to: string;
    from: string;
    symbol: string;
    epochs: number;
    useClosePrice: boolean;
  } = req.query;
  console.log(new Date(), requestQuery);
  const query = `${configurations.apps.goliath}backtest/train?ticker=${requestQuery.symbol}` +
    `&to=${requestQuery.to}&from=${requestQuery.from}&save=false&useClosePrice=${requestQuery.useClosePrice || true}`;

  const options = {
    method: 'GET',
    uri: query,
    json: true
  };

  return request(options).then(async (results) => {
    const params = {
      name: requestQuery.symbol,
      inputs: [],
      outputs: [],
      trainingSize: 7,
      windowSize: 5,
      epochs: requestQuery.epochs || 100,
      learningRate: 0.01,
      layers: 6
    };

    results.forEach((daily) => {
      params.inputs.push(daily.input);
      params.outputs.push(daily.output);
    });

    await MachineLearningService.trainModel(params, (epoch, log, modelParams) => {
      console.log('results: ', epoch, log);
    });
    const score = await MachineLearningService.score(params);
    console.log(score);
    res.send(results);
  });
};

export const customModel = async (req: Request, res: Response) => {
  const requestBody = req.body;
  const symbol = requestBody.symbol;
  const modelName = requestBody.modelName;
  const trainingData = requestBody.trainingData;
  const trainingSize = requestBody.trainingSize;
  const scoreOnly = requestBody.scoreOnly;
  console.log('==========Custom training==========');
  console.log('Date: ', new Date());
  console.log('Model Name: ', modelName);
  console.log('Stock: ', symbol);
  console.log('Data Dates: ', trainingData[0].date, ' - ', trainingData[trainingData.length - 1].date);

  const params = {
    name: requestBody.symbol,
    inputs: [],
    outputs: [],
    trainingSize: trainingSize || 7,
    windowSize: trainingData[0].input.length,
    epochs: requestBody.epochs || 10,
    learningRate: 0.01,
    layers: 6
  };

  trainingData.forEach((daily) => {
    params.inputs.push(daily.input);
    params.outputs.push(daily.output);
  });

  if (!scoreOnly) {
    await MachineLearningService.trainModel(params, (epoch, log, modelParams) => {
      console.log('results: ', epoch, log);
    });
  }

  const score = await MachineLearningService.score(params);
  console.log(score);

  const nextPrediction = await MachineLearningService.makePredictions(
    [trainingData[trainingData.length - 1].input], MachineLearningService.trainedModels[requestBody.modelName]);

  console.log('last input: ', trainingData[trainingData.length - 1].input);
  console.log('next prediction: ', nextPrediction);

  // apiController.savePrediction(requestBody.symbol,
  //   requestBody.modelName,
  //   requestBody.to ? new Date(requestBody.to) : new Date(),
  //   nextPrediction);
  console.log('==========END==========');

  const results = {
    symbol: requestBody.symbol,
    algorithm: requestBody.modelName,
    nextOutput: nextPrediction,
    ...score,
    inputs: params.inputs,
    outputs: params.outputs
  };

  res.send([results]);
};