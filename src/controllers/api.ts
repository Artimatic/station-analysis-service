'use strict';

import async from 'async';
import request from 'request-promise';
import { Response, Request, NextFunction } from 'express';
import Precog from './../services/precog';
import { Query } from '../shared/models/query.interface';
import { TrainingData } from '../shared/models/training-data.interface';
import { NetworkOptions } from '../shared/models/network-options.interface';

/**
 * GET /api
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {
  const requestQuery: Query = req.query;
  console.log(requestQuery);
  const query = `http://localhost:8080/backtest/train?ticker=${requestQuery.symbol}` +
    `&to=${requestQuery.to}&from=${requestQuery.from}`;

  const options = {
    method: 'GET',
    uri: query,
    json: true
  };

  return request(options).then((results) => {
    for (let rate = 1, end = 10; rate < end; rate += 1) {
      const option: NetworkOptions = {
        log: 10000,
        iterations: 20000,
        error: 0.1,
        clear: true,
        rate: 0.01
      };
      const testResults = Precog.testLstm(results, option);
    }

    res.send('testResults');
  });
};
