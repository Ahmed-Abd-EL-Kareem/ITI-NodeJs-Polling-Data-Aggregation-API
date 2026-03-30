const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const userRouter = require('./src/user/user.routes.js')
const pollRouter = require('./src/poll/poll.routes.js')
const optionRouter = require('./src/options/options.route.js' )
const cookieParser = require('cookie-parser')
const AppError = require('./src/utils/appError.js')
const globalErrorHandler = require("./src/middleware/global-error-handling.js")

const app = express()

//! Middleware
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV.trim() === "development") {
  app.use(morgan("dev"));
}
app.use(cors())
app.use(express.json())
app.use(helmet())
app.use(cookieParser());
//! Routes 
app.use('/api/v1/users', userRouter)
app.use('/api/v1/polls', pollRouter)
app.use('/api/v1/options', optionRouter)

app.use(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler)
module.exports = app
