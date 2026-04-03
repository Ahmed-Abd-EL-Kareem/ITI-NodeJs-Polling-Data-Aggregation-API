const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const userRouter = require('./src/user/user.routes.js')
const votesRouter = require('./src/votes/votes.routes.js')
const pollRouter = require('./src/poll/poll.routes.js')
const optionRouter = require('./src/options/options.route.js')
const cookieParser = require('cookie-parser')
const AppError = require('./src/utils/appError.js')
const globalErrorHandler = require("./src/middleware/global-error-handling.js")
const resultsRoute = require("./src/results/result.routes.js")
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss')
const hpp = require('hpp')

const app = express()

//! Middleware
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV.trim() === "development") {
  app.use(morgan("dev"));
}
app.use(cors())
app.use(express.json())
app.use(cookieParser());
app.use(helmet())
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

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
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
});

// Prevent Parameter Pollution attacks
app.use(hpp());

//! Routes 
app.use('/api/v1/users', userRouter)
app.use('/api/v1/polls', pollRouter)
app.use('/api/v1/options', optionRouter)
app.use('/api/v1/votes', votesRouter)
app.use('/api/v1/results', resultsRoute)

app.use(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler)
module.exports = app
