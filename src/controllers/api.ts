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
  console.log(requestQuery);
  const query = `${configurations.apps.goliath}backtest/train?ticker=${requestQuery.symbol}` +
    `&to=${requestQuery.to}&from=${requestQuery.from}`;

  const options = {
    method: 'GET',
    uri: query,
    json: true
  };

  const rate = requestQuery.rate || 0.01;
  return request(options).then((results) => {
    const option: NetworkOptions = {
      log: 10000,
      iterations: 20000,
      error: 0.1,
      clear: true,
      rate: rate
    };
    Precog.testLstm(results, option, res);
  });
};
