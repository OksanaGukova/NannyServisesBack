

import { ONE_DAY } from '../constans/index.js';
import { loginOrSignupWithGoogle, loginUser, logoutUser, refreshUsersSession, registerUser, requestResetToken, resetPassword } from '../services/auth.js';
import { generateAuthUrl } from '../utils/googleOAuth2.js';

export const registerUserController = async (req, res) => {
  await registerUser(req.body);

  // 👇 одразу логінимо
  const result = await loginUser(req.body);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });

  res.cookie('sessionId', result._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully registered!',
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
};

export const loginUserController = async (req, res) => {
  const result = await loginUser(req.body); // ✅ Тепер повертає {user, accessToken, refreshToken}

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', result.sessionId || result._id, {  // ✅ sessionId
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });

  // ✅ ПОВЕРТАЄМО user + accessToken
  res.json({
    status: 200,
    message: 'Successfully logged in!',
    data: {
      accessToken: result.accessToken,
      user: result.user  // ✅ ОТ ЦЕЙ!
    },
  });
};


export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  res.json({
  status: 200,
  message: 'Successfully refreshed a session!',
  data: {
    accessToken: session.accessToken,
    user: session.user, // ✅ ВАЖЛИВО
  },
});
};


export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.json({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};


export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password was successfully reset!',
    status: 200,
    data: {},
  });
};


export const getGoogleOAuthUrlController = async (req, res) => {
  const url = generateAuthUrl();
  res.json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: {
      url,
    },
  });
};


export const loginWithGoogleController = async (req, res) => {
  const session = await loginOrSignupWithGoogle(req.body.code);
  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in via Google OAuth!',
    data: {
      accessToken: session.accessToken,
      user: session.user, // ✅ ДОДАТИ
    },
  });
};
