import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { DI } from '../../../application';
import { AuthenticateKey } from '../../AuthenticateKey';
import generateApiKey from 'generate-api-key';

const router = Router();

router.get(
  '/:userAddress/assets',
  AuthenticateKey,
  async (req: Request, res: Response) => {
    console.log('-- req.params.userAddress :', req.params.userAddress);
    const owner = await DI.userRepository.findOneOrFail({
      userAddress: req.params.userAddress,
    });
    const asset = await DI.assetRepository.find(
      {
        owners: { user: owner },
      },
      { populate: ['creator', 'owners'] },
    );
    res.json(asset);
  },
);

router.get('/genApiKey', async (req: Request, res: Response) => {
  const apiKey = generateApiKey({ method: 'bytes', prefix: 'test_app' });
  res.json(apiKey);
});

router.get('/', AuthenticateKey, async (req: Request, res: Response) => {
  const users = await DI.userRepository.findAll({
    populate: ['profile'],
    limit: 20,
  });
  res.json(users);
});

export const UserController = router;
