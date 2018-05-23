'use strict';

import async from 'async';
import request from 'request-promise';
import { Response, Request, NextFunction } from 'express';
import Precog from './../services/precog';
import { Query } from '../shared/models/query.interface';
import { TrainingData } from '../shared/models/training-data.interface';

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
    const testResults = Precog.testLstm(results);
    res.send(testResults);
  });
};
