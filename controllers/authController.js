/* eslint-disable no-undef */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.header('x-forwarded-proto') === 'https',
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;


  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
//signup of the user
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    catagory: req.body.catagory,
    contact: req.body.contact,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createSendToken(newUser, 201, req, res);
});

//login the user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password, fcm_token } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  await user?.save({ validateBeforeSave: false });
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password or account not found', 401));
  }
  // Check if the device ID (fcm_token) is already associated with the user
  if (user.deviceIds && user.deviceIds !== fcm_token) {
    return next(new AppError('User already logged in on this device', 401));
  }
  user.fcm_token = fcm_token;
  if (!user.deviceIds) {
    user.deviceIds = user.fcm_token
    await user.save({ validateBeforeSave: false })
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});
//logou teh user
exports.logout = async (req, res) => {
  const user = await User.findById(req.user.id)
  user.deviceIds = null
  await user.save({ validateBeforeSave: false });
  req.user.deviceIds = undefined;
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,

  });
  res.status(200).json({ status: 'Logout successful' });
};
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

//forgot password for the user
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on posted email
  const { email } = req.body;
  // console.log(email);
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with this email adress', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Forgot Password Email Template</title>
    <style>
      /* CSS styles go here */
      body {
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        background-color: #f6f6f6;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }
      .header {
        background-color: #127354;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 20px;
      }
      .button {
        display: inline-block;
        background-color: #127354;
        color: #ffffff;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 4px;
        margin-bottom: 20px;
      }
      a{
        color:#ffffff
      }
      .footer {
        background-color: #127354;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Forgot Your Password?</h1>
      </div>
      <div class="content">
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
        <p>To reset your password, please click the button below:</p>
        <a href=${resetURL} class="button">Reset Password</a>
        <p>If you have any questions or concerns, please do not hesitate to contact our support team.</p>
        <p>Best regards,</p>
        <p>The expo Team</p>
      </div>
      <div class="footer">
        <p>Copyright © 2023 expo</p>
      </div>
    </div>
  </body>
</html>
`;

  // 3) Send it to user's email
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      to: `${user.email}`,
      subject: 'Your password reset token (valid for only 10 minutes)',
      html: `${html}`,
    };
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail
      .send(mailOptions)
      .then(() => {
        res.json({
          status: 200,
          msg: 'token sent successfully',
        });
      })
      .catch((error) => {
        res.json({ status: 400, msg: error });
      });

    // await new Email(user, resetURL).sendPasswordReset(html);

    // res.status(200).json({
    //   status: 'success',
    //   message: 'Token sent to email!',
    // });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

//reset password for the user
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  // 3) Update changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});
//restriction based on the roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin'] role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});
