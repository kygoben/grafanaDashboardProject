//package.json should contain type: module for import statements to work 
import express from 'express';
import { collectDefaultMetrics, register } from 'prom-client';

collectDefaultMetrics();

const app = express();

const gauge = new Gauge({ name: 'api_http_requests_total', help: "api_http_requests_total_help", labelNames: ['custom'] });
register.registerMetric(gauge);
register.registerMetric(httpRequestDurationMicroseconds);
collectDefaultMetrics({ register });
gauge.set(0);

app.use((req, res, next) => {
    res.locals.startEpoch = Date.now()
    next()
})

app.use((req, res, next) => { gauge.inc(1); next(); });

//The grafana agents calls this metrics route to get metrics from the node app
app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});


app.use((req, res, next) => {
  const responseTimeInMs = new Date() - res.locals.startEpoch;
  httpRequestDurationMicroseconds
      .labels(req.route.path)
      .observe(responseTimeInMs);

  next();
})

app.listen(4001, '0.0.0.0');