import { Response, Request } from 'express';
import configurations from '../configurations';
import request from 'request-promise';
import MachineLearningService from '../services/machine-learning.service';

export const trainModelV2 = async (req: Request, res: Response) => {
  const requestQuery: {
    to: string,
    from: string,
    symbol: string,
    epochs: number
  } = req.query;
  console.log(new Date(), requestQuery);
  const query = `${configurations.apps.goliath}backtest/train?ticker=${requestQuery.symbol}` +
    `&to=${requestQuery.to}&from=${requestQuery.from}&save=false`;

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
