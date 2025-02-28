import express from 'express';
import { createServer, Server } from 'http';
import cors from 'cors';
import * as dotenv from 'dotenv';
import ws from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import {
  Connection,
  EntityManager,
  EntityRepository,
  IDatabaseDriver,
  MikroORM,
  RequestContext,
} from '@mikro-orm/core';

import { graphqlUploadExpress } from 'graphql-upload-ts';

import { MessageResolver } from './resolvers/message.resolver';
import config from './mikro-orm.config';
import { UserResolver } from './resolvers/user.resolver';
import { AssetResolver } from './resolvers/asset.resolver';
import { customAuthChecker } from './utils/AuthChecker';
import { verify } from 'jsonwebtoken';
import User from './entities/user.entity';
import { IPayload, IUser } from './interfaces/context.interface';
import { AssetCollectionResolver } from './resolvers/assetCollection.resolver';
import { OrderResolver } from './resolvers/order.resolver';
import { ActivityResolver } from './resolvers/activity.resolver';
import { MarketEventResolver } from './resolvers/marketEvent.resolver';
import AssetContract, { MetaType } from './entities/assetContract.entity';
import { ItemType } from './constants';
import { SearchResolver } from './resolvers/search.resolver';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import Asset from './entities/asset.entity';
import { V1Router } from './rest/routes/v1';
import swaggerUi from 'swagger-ui-express';
import swaggerAutogen from 'swagger-autogen';
import swaggerDocument from './swagger-json';
import { ImageUploadResolver } from './resolvers/imageUpload.resolver';

dotenv.config();

const doc = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'My API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local server',
      },
    ],
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles =
  process.env.NODE_DEV === 'true'
    ? ['./rest/routes/v1/index.ts']
    : ['./rest/routes/v1/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
export const DI = {} as {
  orm: MikroORM;
  em: EntityManager;
  userRepository: EntityRepository<User>;
  assetRepository: EntityRepository<Asset>;
};

export default class Application {
  public orm!: MikroORM<IDatabaseDriver<Connection>>;
  public expressApp!: express.Application;
  public httpServer!: Server;
  public apolloServer!: ApolloServer;
  public subscriptionServer!: ws.Server;

  public connect = async (): Promise<void> => {
    try {
      this.orm = await MikroORM.init(config);
      DI.orm = this.orm;
      DI.em = DI.orm.em;
      DI.userRepository = DI.em.getRepository(User);
      DI.assetRepository = DI.em.getRepository(Asset);
      // migration
      const migrator = this.orm.getMigrator();
      const migrations = await migrator.getPendingMigrations();
      if (migrations && migrations.length > 0) {
        await migrator.up();
      }
      // seed data
      const user = await this.orm.em.findOne(User, {
        userAddress: '0x0000000000000000000000000000000000000000',
      });
      if (!user) {
        // Create User
        const zeroUser = new User('0x0000000000000000000000000000000000000000');
        this.orm.em
          .getRepository(User)
          .persistAndFlush(zeroUser)
          .then(() => console.log('💪 zeroUser persisted to database'))
          .catch((err) => console.log('😱 something went wrong!:', err));
      }
      const sharedStoreContractAddress = process.env.SHAREDASSET_CONTRACT;
      const contract = await this.orm.em.findOne(AssetContract, {
        contractAddress: sharedStoreContractAddress,
      });
      if (!contract) {
        // Create Contract
        const sharedStoreContract = new AssetContract(
          ItemType.ERC1155,
          MetaType.CENTRALIZED,
          sharedStoreContractAddress,
          'ShareAsset',
          'Shared Store Contract',
        );
        this.orm.em
          .getRepository(AssetContract)
          .persistAndFlush(sharedStoreContract)
          .then(() =>
            console.log('💪 sharedStoreContract persisted to database'),
          )
          .catch((err) => console.log('😱 something went wrong!:', err));

        const lazyMintContractAddress = process.env.LAZY_MINT_ADAPTER;
        const lazyMintAssetContract = new AssetContract(
          ItemType.ERC1155,
          MetaType.CENTRALIZED,
          lazyMintContractAddress,
          'lazyMintAsset',
          'Lazy Mint Asset Contract',
        );
        this.orm.em
          .getRepository(AssetContract)
          .persistAndFlush(lazyMintAssetContract)
          .then(() =>
            console.log('💪 lazyMintAssetContract persisted to database'),
          )
          .catch((err) => console.log('😱 something went wrong!:', err));

        const nativeTokenContractAddress = process.env.NATIVE_TOKEN;
        const nativeTokenContract = new AssetContract(
          ItemType.NATIVE,
          MetaType.DECENTRALIZED,
          nativeTokenContractAddress,
          'nativeTokenContract',
          'Native Token Contract',
          'BOA',
        );
        this.orm.em
          .getRepository(AssetContract)
          .persistAndFlush(nativeTokenContract)
          .then(() =>
            console.log('💪 nativeTokenContract persisted to database'),
          )
          .catch((err) => console.log('😱 something went wrong!:', err));
      }
      // const seeder = this.orm.getSeeder();
      // const ret = seeder.seed(DatabaseSeeder);
      // console.log('seed ret:', ret);
    } catch (error) {
      console.error('📌 Could not connect to the database', error);
      throw Error(String(error));
    }
  };

  public async init() {
    this.expressApp = express();
    this.httpServer = createServer(this.expressApp);

    const corsOptions = {
      origin: '*', // FIXME: change me to fit your configuration
    };

    this.expressApp.use(
      helmet(),
      bodyParser.json(),
      // morgan('dev'),
      cors(corsOptions),
      graphqlUploadExpress({ maxFileSize: 13_000_000, maxFiles: 10 }),
    );

    this.expressApp.use((req, res, next) =>
      RequestContext.create(DI.orm.em, next),
    );

    this.expressApp.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument),
    );
    this.expressApp.use('/api/v1', V1Router);

    this.expressApp.get('/', (_req, res) => res.send('Hello, World!'));

    // generate the graphql schema
    const schema = await buildSchema({
      resolvers: [
        MessageResolver,
        UserResolver,
        AssetResolver,
        AssetCollectionResolver,
        OrderResolver,
        ActivityResolver,
        MarketEventResolver,
        SearchResolver,
        ImageUploadResolver,
      ],
      validate: false,
      authChecker: customAuthChecker,
    });

    // initialize the ws server to handle subscriptions
    this.subscriptionServer = new ws.Server({
      server: this.httpServer,
      path: '/graphql',
    });

    // initalize the apollo server, passing in the schema and then
    // defining the context each query/mutation will have access to
    this.apolloServer = new ApolloServer({
      schema,
      context: ({ req, res }) => {
        const authorization = req.headers.authorization;
        let payload: IPayload | null = null;
        if (authorization) {
          try {
            const token = authorization.split(' ')[1];
            payload = verify(token, process.env.JWT_SECRET);
          } catch (e) {
            console.log('auth verification error:', e);
          }
        }
        const user: IUser | null = payload
          ? {
              id: payload.id,
              name: payload.name,
              userAddress: payload.userAddress,
            }
          : null;

        return {
          req,
          res,
          user,
          em: this.orm.em.fork(),
        };
      },
      formatError: (error) => {
        console.log('GraphQL error\n:', error);
        return error;
      },
      plugins: [
        // we need to use a callback here since the subscriptionServer is scoped
        // to the class and would not exist otherwise in the plugin definition
        (subscriptionServer = this.subscriptionServer) => {
          return {
            async serverWillStart() {
              return {
                async drainServer() {
                  subscriptionServer.close();
                },
              };
            },
          };
        },
      ],
    });

    // you need to start the server BEFORE applying middleware
    await this.apolloServer.start();
    // pass the express app and the cors config to the middleware
    this.apolloServer.applyMiddleware({
      app: this.expressApp,
      cors: corsOptions,
    });

    const port = process.env.PORT || 4000;
    this.httpServer.listen(port, () => {
      // pass in the schema and then the subscription server
      useServer(
        {
          schema,
          context: { em: this.orm.em.fork() },
        },
        this.subscriptionServer,
      );
      console.log(`httpServer listening at http://localhost:${port}`);
    });
  }
}
