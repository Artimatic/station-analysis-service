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
    `&to=${requestQuery.to}&from=${requestQuery.from}&save=false&useClosePrice=false`;

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
      testResults.push(Precog.testLstm(requestQuery.symbol, results, option));
    }

    res.send(testResults);
  });
};

export const activateNetwork = (req: Request, res: Response) => {
  const requestBody = req.body;
  console.log(new Date(), requestBody);
  const prediction = Precog.activate(requestBody.symbol, requestBody.input, requestBody.round);

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

export const testModel = (req: Request, res: Response) => {
  const requestQuery: Query = req.query;
  console.log(new Date(), requestQuery);
  const query = `${configurations.apps.main}api/machine-learning/train`;

  const options = {
    method: 'GET',
    uri: query,
    qs: {
      symbol: requestQuery.symbol,
      endDate: requestQuery.to,
      startDate: requestQuery.from
    }
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
      testResults.push(Precog.testLstmClosePrice(requestQuery.symbol, JSON.parse(results), option));
    }

    res.send(testResults);
  });
};

export const customModel = (req: Request, res: Response) => {
  const requestBody = req.body;
  const symbol = requestBody.symbol;
  const modelName = requestBody.modelName;
  const trainingData = requestBody.trainingData;
  console.log('==========Custom train==========');
  console.log('Date: ', new Date());
  console.log('Model Name: ', modelName);
  console.log('Stock: ', symbol);
  console.log('Data Dates: ', trainingData[0].date, ' - ', trainingData[trainingData.length - 1].date);

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

    testResults.push(Precog.testIntradayModels(symbol, modelName, trainingData, option));
  }
  console.log('==========END==========');

  res.send(testResults);
};

export const activateCustomModel = (req: Request, res: Response) => {
  const requestBody = req.body;
  console.log(new Date(), requestBody);
  const prediction = Precog.activateCustom(requestBody.symbol, requestBody.modelName, requestBody.input, requestBody.round);

  request.post({
    uri: configurations.apps.goliath + 'precog/prediction',
    json: true,
    gzip: true,
    body: {
      symbol: requestBody.symbol + '_intraday',
      results: [prediction]
    }
  });
  console.log('Prediction: ', prediction);

  res.send(prediction);
};

export const activateV2Network = (req: Request, res: Response) => {
  const requestBody = req.body;
  console.log(new Date(), requestBody);
  const prediction = Precog.activate(requestBody.symbol, requestBody.input, requestBody.round, true);

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