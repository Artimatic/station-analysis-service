"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const precog_1 = __importDefault(require("./../services/precog"));
/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
    const results = precog_1.default.train();
    res.send(results);
};
//# sourceMappingURL=api.js.map