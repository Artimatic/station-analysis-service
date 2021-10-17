import express from 'express';
import { urlencoded, json } from 'express';
import compression from 'compression';  // compresses requests
import bodyParser from 'body-parser';
import lusca from 'lusca';
import dotenv from 'dotenv';
import flash from 'express-flash';
import path from 'path';
import passport from 'passport';
import expressValidator from 'express-validator';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env.example' });

// Controllers (route handlers)
import * as apiController from './controllers/api';
import * as machineLearningController from './controllers/machine-learning.controller';

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(expressValidator());

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  next();
});

app.use(
  express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
);

/**
 * API routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/test-model', apiController.testModel);
app.post('/api/score-custom', apiController.scoreCustomModel);
app.post('/api/train-custom', apiController.customModel);
app.post('/api/activate-custom', apiController.activateCustomModel);
app.post('/api/activate', apiController.activateNetwork);
app.post('/api/v2/activate', apiController.activateV2Network);
app.get('/api/train-model', machineLearningController.trainModelV2);
app.post('/api/tensor/train-model', machineLearningController.customModel);

app.get(
  '/health',
  function(req, res) {
      res.send({
        status: 'UP'
    });
  }
);

export default app;
