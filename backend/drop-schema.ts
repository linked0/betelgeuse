import { MikroORM } from '@mikro-orm/core';
import config from './src/mikro-orm.config';

(async () => {
  const orm = await MikroORM.init(config);
  const generator = orm.getSchemaGenerator();
  await generator.dropSchema();

  await orm.close(true);
})();
