"use strict";

import async from "async";
import request from "request";
import { Response, Request, NextFunction } from "express";
import Precog from "./../services/precog";

/**
 * GET /api
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {
  const results = Precog.train();
  res.send(results);
};
