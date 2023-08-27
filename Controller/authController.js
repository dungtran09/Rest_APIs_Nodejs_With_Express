const User = require("../Models/userModel");
const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const CustomError = require("../Utils/CustomError");
const util = require("util");
const sendEmail = require("../Utils/Email");
const fs = require("fs");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SCRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

// to create new user
exports.signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);
  res.status(201).json({
    status: "Success",
    token,
    data: {
      newUser,
    },
  });
});

// to login user
exports.login = asyncErrorHandler(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    const err = new CustomError("Enter Email and Password!", 400);
    return next(err);
  }

  const user = await User.findOne({ email }).select("+password");
  const isMatch = await user?.comparePasswordInDb(password, user.password);

  if (!user || !isMatch) {
    const err = new CustomError("Password or Email is not correct!", 404);
    return next(err);
  }

  const token = signToken(user.id);

  res.status(200).json({
    status: "Success",
    token,
  });
});

// to prorect router
exports.protect = asyncErrorHandler(async (req, res, next) => {
  // Read token and check if exist or not
  const testToken = req.headers.authentication;
  let token;

  if (testToken && testToken.startsWith("bearer")) {
    token = testToken.split(" ")[1];
  }

  if (!token) {
    return next(new CustomError("You are not logged!", 404));
  }

  // validate token
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SCRET_STR,
  );

  // check if the use exist or not
  const user = await User.findById({ _id: decodedToken.id });
  if (!user) {
    return next(
      new CustomError("The user with given token does not exist!", 401),
    );
  }

  // check if the use changed password after the token was issued
  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
  if (isPasswordChanged) {
    return next(
      new CustomError("Password has been changed recenlly. Login again.", 401),
    );
  }

  req.user = user;
  // If all test passed allow use access route
  next();
});

// to validate permission before perfrom an acction
exports.restrict = (role) => {
  return (req, res, next) => {
    if (req.user.role != role) {
      return next(
        new CustomError(
          "You do not have permission to perform this acction!",
          403,
        ),
      );
    }
    next();
  };
};

// Reset password
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  // check email in server
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new CustomError("We could not find the user with given email!"),
    );
  }

  // generate a random reset token
  const resetToken = user.createResetPasswordToken();

  // save token
  try {
    fs.writeFileSync("./test_API/config/token_reset_password.txt", resetToken);
    console.log("Write Reset Token Successfully!");
  } catch (error) {
    console.log(error.message);
  }

  await user.save({ validateBeforeSave: false });

  // send the token back to the user mail
  const resetUrl = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `We have recived a password reset request. Click link below to reset your password!\n ${resetUrl}\n\nThis link reset will be exprie in 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset password!",
      message: message,
    });

    res.status(200).json({
      status: "Success",
      message: "Password reset link sended to the email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpries = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new CustomError(
        "There was an error sending password reset email. Try again later!",
        500,
      ),
    );
  }
});

//
exports.passwordReset = asyncErrorHandler(async (req, res, next) => {
  // find user on server
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpries: { $gt: Date.now() },
  });

  // return error if user not found
  if (!user) {
    return next(new CustomError("Token is invalid or expried!", 400));
  }

  // reset the user password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpries = undefined;
  user.passwordChangedAt = Date.now();

  await user.save({ validateModifiedOnly: true });

  // login user
  const loginToken = signToken(user._id);

  res.status(200).json({
    status: "Success",
    token: loginToken,
  });
});
