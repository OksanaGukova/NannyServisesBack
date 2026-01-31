

import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { loginUserSchema, loginWithGoogleOAuthSchema, registerUserSchema, requestResetEmailSchema, resetPasswordSchema } from '../validations/auth.js';
import { getGoogleOAuthUrlController, loginUserController, loginWithGoogleController, logoutUserController, refreshUserSessionController, registerUserController, requestResetEmailController, resetPasswordController } from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { loginIpLimiter, loginUserLimiter, rateLimitMiddleware, resetPasswordLimiter } from '../middlewares/rateLimiters.js';


const router = Router();

router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);

router.post(
  '/login',
  validateBody(loginUserSchema),
  rateLimitMiddleware(loginIpLimiter), // спочатку ліміт по IP
  rateLimitMiddleware(
    loginUserLimiter,
    (req) => req.body.email // потім ліміт по email
  ),
  ctrlWrapper(loginUserController), // потім контролер
);

router.post('/logout', ctrlWrapper(logoutUserController));

router.post('/refresh', ctrlWrapper(refreshUserSessionController));

router.post(
  '/request-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController),
);

router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
    rateLimitMiddleware(
    resetPasswordLimiter,
    (req) => req.body.email
  ),
  ctrlWrapper(resetPasswordController)

);

router.get('/get-oauth-url', ctrlWrapper(getGoogleOAuthUrlController));

router.post(
  '/confirm-oauth',
  validateBody(loginWithGoogleOAuthSchema),
  ctrlWrapper(loginWithGoogleController),
);

export default router;
