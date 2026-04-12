const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const { globalLimiter } = require('./src/middleware/rate-limit.middleware.js')
const userRouter = require('./src/user/user.routes.js')
const votesRouter = require('./src/votes/votes.routes.js')
const pollRouter = require('./src/poll/poll.routes.js')
const optionRouter = require('./src/options/options.route.js')
const cookieParser = require('cookie-parser')
const AppError = require('./src/utils/appError.js')
const globalErrorHandler = require("./src/middleware/global-error-handling.js")
const resultsRoute = require("./src/results/result.routes.js")
const uploadRouter = require("./src/upload/upload.routes.js")
const { sanitize: sanitizeMongo } = require('express-mongo-sanitize')
const xss = require('xss')
const hpp = require('hpp')

const app = express()

/** Express 5 exposes `req.query` as a getter-only property; assign via defineProperty. */
function setQuery(req, value) {
  Object.defineProperty(req, 'query', {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  })
}

//! Middleware
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV.trim() === "development") {
  app.use(morgan("dev"));
}
app.use(cors({
  origin: [
    'https://polling-data-aggregation-api-front.vercel.app',
    'http://localhost:5173',
  ],
  credentials: true,
}));
app.use(express.json())
app.use(cookieParser());
app.use(helmet())
app.use(compression())
// Data sanitization against NoSQL query injection (Express 5–compatible: cannot assign req.query)
app.use((req, res, next) => {
  if (req.body) req.body = sanitizeMongo(req.body)
  if (req.params && Object.keys(req.params).length) sanitizeMongo(req.params)
  if (req.headers) sanitizeMongo(req.headers)
  const q = req.query
  if (q && Object.keys(q).length) {
    const copy = { ...q }
    sanitizeMongo(copy)
    setQuery(req, copy)
  }
  next()
})

// Data sanitization against XSS (sanitize strings inside body/query/params)
app.use((req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === "string") return xss(value);
    if (Array.isArray(value)) return value.map(sanitizeValue);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)])
      );
    }
    return value;
  };

  req.body = sanitizeValue(req.body);
  const sq = sanitizeValue(req.query)
  if (sq && typeof sq === "object" && Object.keys(sq).length) {
    setQuery(req, sq)
  }
  req.params = sanitizeValue(req.params);
  next();
});

// Prevent Parameter Pollution attacks
app.use(hpp());

app.use('/api', globalLimiter);
//! Routes 
app.use('/api/v1/users', userRouter)
// Alias for clients that use /auth/* (e.g. POST /auth/login → same as POST /api/v1/users/login)
app.use('/auth', userRouter)
app.use('/api/v1/polls', pollRouter)
app.use('/api/v1/options', optionRouter)
app.use('/api/v1/votes', votesRouter)
app.use('/api/v1/results', resultsRoute)
app.use('/api/v1/upload', uploadRouter)

// Alias: clients that call /polls instead of /api/v1/polls (e.g. wrong base URL)
app.get('/polls', (req, res) => {
  res.redirect(301, '/api/v1/polls' + req.url.slice('/polls'.length))
})

app.use(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler)
module.exports = app
