'use strict';

import request from 'request-promise';
import { Response, Request } from 'express';
import Precog from './../services/precog';
import { Query } from '../shared/models/query.interface';
import { NetworkOptions } from '../shared/models/network-options.interface';
import configurations from '../configurations';

export const getApi = (req: Request, res: Response) => {
  const requestQuery: Query = req.query;
  console.log(new Date(), requestQuery);
  const query = `${configurations.apps.goliath}backtest/train?ticker=${requestQuery.symbol}` +
    `&to=${requestQuery.to}&from=${requestQuery.from}&save=false`;

  const options = {
    method: 'GET',
    uri: query,
    json: true
  };

  return request(options).then((results) => {
    const testResults = [];
    const rates = [0.01];
    for (let rate = 0, end = rates.length; rate < end; rate++) {
      const option: NetworkOptions = {
        trainingSize: 0.7,
        log: 10000,
        iterations: 8000,
        error: 0.1,
        clear: true,
        rate: rates[rate]
      };
      testResults.push(Precog.testLstm(results, option));
    }

    res.send(testResults);
  });
};

export const activateNetwork = (req: Request, res: Response) => {
  const requestBody = req.body;
  console.log(new Date(), requestBody);
  const prediction = Precog.activate(requestBody.input, requestBody.round);

  const date = new Date(requestBody.to);
  request.post({
    uri: configurations.apps.goliath + 'precog/prediction',
    json: true,
    gzip: true,
    body: {
      symbol: requestBody.symbol,
      date: date.toISOString(),
      results: [prediction]
    }
  });
  console.log('Prediction: ', prediction);

  res.send(prediction);
};
