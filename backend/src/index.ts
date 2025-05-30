import Application from './application';
import 'reflect-metadata';
import * as dotenv from 'dotenv';

dotenv.config();

export const PRODUCTION = process.env.NODE_ENV === 'production';
export let application: Application;

async function main() {
  console.log('NODE_DEV :', process.env.NODE_DEV);
  console.log('DEPLOY_TARGET :', process.env.DEPLOY_TARGET);
  console.log('POSTGRES_DB :', process.env.POSTGRES_DB);
  console.log('JWT_SECRET :', process.env.JWT_SECRET);
  console.log('S3_REGION :', process.env.S3_REGION);
  console.log('ASSET_CONTRACT_SHARED_ADDRESS :', process.env.ASSET_CONTRACT_SHARED_ADDRESS);
  console.log('LAZY_MINT_ADAPTER :', process.env.LAZY_MINT_ADAPTER);
  console.log('NATIVE_TOKEN :', process.env.NATIVE_TOKEN);
  application = new Application();
  await application.connect();
  await application.init();
}

main();
