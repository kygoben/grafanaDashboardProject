//package.json should contain type: module for import statements to work 
import express from 'express';
import { collectDefaultMetrics, register } from 'prom-client';

collectDefaultMetrics();

const app = express();
//The grafana agents calls this metrics route to get metrics from the node app
app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

app.listen(4001, '0.0.0.0');