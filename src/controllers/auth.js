

import createHttpError from 'http-errors';
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
  try {
    console.log('🔍 GET OAUTH URL called');

    const url = generateAuthUrl();

    console.log('✅ Generated URL:', url);

    res.json({
      status: 200,
      message: 'Successfully get Google OAuth url!',
      data: {
        url,
      },
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};


export const loginWithGoogleController = async (req, res, next) => {
  try {
        console.log('🔍 Full URL:', req.originalUrl);
    console.log('📥 Query params:', req.query);
    console.log('📥 Code:', req.query.code);
    const { code } = req.query;
  if (!code) {
      console.error('❌ NO CODE PROVIDED');
      console.log('Available params:', Object.keys(req.query));
      throw createHttpError(400, 'No authorization code provided');
    }

    const session = await loginOrSignupWithGoogle(code);
    setupSession(res, session);

    // ✅ Повертаємо HTML сторінку що закриває окно та передає токен
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
        </head>
        <body>
          <script>
            const data = {
              accessToken: '${session.accessToken}',
              user: ${JSON.stringify(session.user)}
            };

            // ✅ Передаємо дані в localStorage
            localStorage.setItem('authData', JSON.stringify(data));
            localStorage.setItem('token', '${session.accessToken}');

            // ✅ Закриваємо вікно або перенаправляємо
            window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:5173'}/nannies';
          </script>
        </body>
      </html>
    `;

    res.send(html);
    } catch (error) {
    console.error('❌ Error:', error.message);
    next(error);
  }
};
