/* eslint-disable no-undef */
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

const userRouter = require('./routes/userRoutes');
const classRouter = require('./routes/classRoutes');
const chatRouter = require('./routes/chatRoute');
const messageRouter = require('./routes/messageRoutes');
const lectureRouter = require('./routes/lectureRoutes');
const subjectRouter = require('./routes/subjectRoutes');
const pastPaperRouter = require('./routes/pastPaperRoutes');
const currentPaperRouter = require('./routes/currentPaperRoutes');
const mcqRouter = require('./routes/mcqRouter');
const longQuestionRouter = require('./routes/longQuestionRouter');
const shortQuestionRouter = require('./routes/shortQuestionRouter');
const yearRouter = require('./routes/YearRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// 1) ****---GLOBAL MIDDLEWARES-------****

// Configration of the environment variables

app.use(cors());
app.options('*', cors());
app.enable('trust proxy');
dotenv.config({ path: './config.env' });

// Set security HTTP headers
app.use(helmet());
// Development logging
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}
// console.log(process.env.NODE_ENV);
// app.use(compression());
// Limit requests from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!',
// });

// app.use('/api', limiter);
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
//serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());
// Serving static files

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.requestTime);
  // console.log(req.cookies);
  next();
});
// 2) ****--------ROUTES---------*****

app.use('/api/v1/users', userRouter);
app.use('/api/v1/classes', classRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/subjects', subjectRouter);
app.use('/api/v1/lectures', lectureRouter);
app.use('/api/v1/pastPaper', pastPaperRouter);
app.use('/api/v1/currentPaper', currentPaperRouter);
app.use('/api/v1/years', yearRouter);
app.use('/api/v1/mcqs', mcqRouter);
app.use('/api/v1/shortQuestion', shortQuestionRouter);
app.use('/api/v1/longQuestions', longQuestionRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//3)****----------error-handling--------****
app.use(globalErrorHandler);
module.exports = app;
