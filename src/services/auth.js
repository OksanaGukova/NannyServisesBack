import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import { ACCOUNT_LOCK_TIME_MS, FIFTEEN_MINUTES, LOGIN_ATTEMPT_THRESHOLD, ONE_DAY, SMTP, TEMPLATES_DIR} from '../constans/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { getFullNameFromGoogleTokenPayload, validateCode } from '../utils/googleOAuth2.js';


export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,

  });
};


export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  // Не розкривати, що користувача нема — повертаємо загальну помилку
  if (!user) throw createHttpError(401, 'Unauthorized');

  // Якщо акаунт заблоковано
  if (user.lockUntil && new Date() < new Date(user.lockUntil)) {
    throw createHttpError(423, 'Account locked. Try later.');
  }

  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    // Інкремент failedLoginAttempts
    const newFailed = (user.failedLoginAttempts || 0) + 1;

    if (newFailed >= LOGIN_ATTEMPT_THRESHOLD) {
      // Досягли порогу — блокувати акаунт і скинути лічильник
      await UsersCollection.updateOne(
        { _id: user._id },
        { $set: { lockUntil: new Date(Date.now() + ACCOUNT_LOCK_TIME_MS), failedLoginAttempts: 0 } },
      );
    } else {
      await UsersCollection.updateOne(
        { _id: user._id },
        { $inc: { failedLoginAttempts: 1 } },
      );
    }

    throw createHttpError(401, 'Unauthorized');
  }

  // Успішний логін — скидаємо лічильник та lockUntil
  await UsersCollection.updateOne(
    { _id: user._id },
    { $set: { failedLoginAttempts: 0, lockUntil: null } },
  );

  // Очистити старі сесії і створити нову
  await SessionsCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

    const session = await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });

  // ✅ ПОВЕРТАЄМО user + session
   return {
    sessionId: session._id,        // ✅ для cookie
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: {                        // ✅ user об'єкт з _id
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'parent'
    }
  };
};


export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};


const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

   const newSession = createSession();
  const updatedSession = await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });

  // ✅ Знаходимо user
  const user = await UsersCollection.findById(session.userId).select('_id name email role');

  return {
  _id: updatedSession._id, // ✅ ДОДАЙ
  user,
  accessToken: updatedSession.accessToken,
  refreshToken: updatedSession.refreshToken
};
};


export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};


export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  const user = await UsersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};


export const loginOrSignupWithGoogle = async (code) => {
  const loginTicket = await validateCode(code);
  const payload = loginTicket.getPayload();
  if (!payload) throw createHttpError(401);

  let user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    const password = await bcrypt.hash(randomBytes(10), 10);
    user = await UsersCollection.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
      role: 'parent',
    });
  }

   const newSession = createSession();
  const session = await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken: session.accessToken,
    refreshToken: session.refreshToken
  };
};
