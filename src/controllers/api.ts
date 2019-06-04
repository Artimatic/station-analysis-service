'use strict';

import async from 'async';
import request from 'request-promise';
import { Response, Request } from 'express';
import Precog from './../services/precog';
import { Query } from '../shared/models/query.interface';
import { TrainingData } from '../shared/models/training-data.interface';
import { NetworkOptions } from '../shared/models/network-options.interface';
import configurations from '../configurations';

/**
 * GET /api
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {
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
    const rates = [0.05, 0.06, 0.07, 0.08, 0.09, 0.1];
    for (let rate = 0, end = rates.length; rate < end; rate++) {
      const option: NetworkOptions = {
        log: 10000,
        iterations: 8000,
        error: 0.1,
        clear: true,
        rate: rates[rate]
      };
      testResults.push(Precog.testLstm(results, option));
    }

    const date = new Date(requestQuery.to);
    request.post({
      uri: configurations.apps.goliath + 'precog/prediction',
      json: true,
      gzip: true,
      body: {
        symbol: requestQuery.symbol,
        date: date.toISOString(),
        results: testResults
      }
    });

    res.send(testResults);
  });
};
