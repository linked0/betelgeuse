import { DI } from '../application';
import { wrap } from '@mikro-orm/core';

const authenticateKey = async (req, res, next) => {
  const apiKey = req.header('x-api-key'); // Add API key to headers

  const user = await DI.userRepository.findOne({
    apiKey,
  });

  if (apiKey && user) {
    const MAX = 10000;
    if (user.usageCount >= MAX) {
      res.status(429).send({
        error: {
          code: 429,
          message: 'Max API calls exceeded.',
        },
      });
    } else {
      wrap(user).assign({ usageCount: user.usageCount + 1 });
      next();
    }
  } else {
    // Reject request if API key doesn't match
    res.status(403).send({ error: { code: 403, message: 'You not allowed.' } });
  }
};
export const AuthenticateKey = authenticateKey;
