# pooh-land-backend

## Set Environment file and Initialize

### 임시 파일 저장 디렉토리 생성
```
mkdir temp_image
```

### 환경변수 파일 생성
```
cp .env.example .env
```

### RPC_URL과 컨트랙트 주소 세팅
```
RPC_URL=http://localhost:8585
SHAREDASSET_CONTRACT=0x2c8453d203162C7C93ebDe5CdE1FEdf81d64d393
LAZY_MINT_ADAPTER_ADDRESS=0x87cFe4286Ba6796Dd0A3FE88D85d9976Ef2262A5
```

### clean tables
```
yarn drop-schema
```

### Run Server locally 
```
yarn drop-schema
rm -rf src/migrations/*
yarn migration-create
yarn migration-up
```

### Run docker
You can run docker desktop in Mac Launchpad.

### Run Server locally (old version)
사실 `yarn start:refresh`은 제대로 실행이 안됨. 따라서, 위의 초기화 단계를 거치고, `yarn start`로 실행하는 것이 좋음.

- 데이터베이스를 다시 생성하며 실행
```
yarn start:refresh
```


### 기존 데이버베이스 및 데이터를 유지하며 실행
```
yarn start-no-db
```
or 
```
yarn start
```

### Error
#### Error 1
```
GraphQL error
: [UserInputError: Variable "$name" of required type "String!" was not provided.] {
  locations: [ { line: 1, column: 32 } ],
  path: undefined,
  extensions: { code: 'BAD_USER_INPUT', exception: { stacktrace: [Array] } }
}
```
--> 아직 해결 안됨.


#### Error 2
```
uploadImage.filename Manga-col1.jpg
Created temp file file:///Users/jay/work/pooh-land-backend/temp_image/4G3yekfAL-original---Manga-col1.jpg
Read 203877 bytes to buffer
putS3:from temp file /Users/jay/work/pooh-land-backend/temp_image/4G3yekfAL-original---Manga-col1.jpg
e : Error: Failed to upload file: Error: Failed PutObjectCommand to bucket poohland for file image-store/4G3yekfAL-original---Manga-col1.jpg
    at uploadImage (/Users/jay/work/pooh-land-backend/src/utils/Image.ts:47:11)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at ImageUploadResolver.uploadSingleImage (/Users/jay/work/pooh-land-backend/src/resolvers/imageUpload.resolver.ts:28:32)
    at dispatchHandler (/Users/jay/work/pooh-land-backend/node_modules/type-graphql/dist/resolvers/helpers.js:83:24)
    at /Users/jay/work/pooh-land-backend/node_modules/type-graphql/dist/resolvers/helpers.js:84:26
    at dispatchHandler (/Users/jay/work/pooh-land-backend/node_modules/type-graphql/dist/resolvers/helpers.js:83:24)
```
--> AWS Access Key가 환경변수에 세팅되어야 함
- AWS Console -> IAM -> Users -> "Security credentials" 텝의 "Access keys" 섹션에서 키를 생성할 수 있음. 
```
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=xxx
export AWS_REGION=ap-northeast-2
```

## DB Schema
- `doc/PoohLand.erd`를 pgAdmin의 ERD Tool에서 열면 확인 가능함.
- 아직 완성된 버전이 아님.(2024.10.02 현재)
  
## Apollo GraphQL Explorer

```
# local
http://localhost:4000/graphql

```

### GraphQL Test
- GetAssetCollection의 리턴 값이 AssetCollection, BaseError를 가지는 union 타입이기때문에 아래와 같이 Body를 설정해줘야 함.
- localhost:4000/graphql
```
{
  "query": "query GetAssetCollection($id: String!) { GetAssetCollection(id: $id) { ... on AssetCollection { id name description assets { id name } } ... on BaseError { name statusCode } } }",
  "variables": {
    "id": "2e1ea2a0-8893-490f-99a0-d4732f738f09"
  }
}
```
### GraphQL Test 2
- AssetCollection 타입을 리턴하는 경우 참고용
- localhost:4000/graphql
```
{
  "query": "query GetAssetCollection2($id: String!) { GetAssetCollection2(id: $id) { name } }",
  "variables": {
    "id": "4503d7da-9cdb-4acd-8b8f-ec9588a321cc"
  }
}
```
위 Request에 대해서 다음의 Resolver 코드가 적용됨 (assetCollection.resolver.ts)

```
  @Query(() => AssetCollection)
  async GetAssetCollection2(
    @Arg('id') id: string,
    @Ctx() ctx: ReqContext,
  ): Promise<typeof AssetCollectionServiceResponse> {
    try {
      const { em } = ctx;

      const assetCollection: AssetCollection = await em.findOneOrFail(
        AssetCollection,
        {
          id,
        },
        {
          populate: ['assets'],
        },
      );
      return assetCollection;
    } catch (e) {
      return new ApiUserError(
        this.constructor.name,
        'failed to retrieve assetCollection.',
      );
    }
  }
```

## Initialize Database and Deploy
1. Remove migrations - Only Local
 : migration files in the source folder

2. Create migration - Only Local
```
npx mikro-orm migration:create --initial
```
3. Delete data from migration table

4. Drop schema

ts-node 설치
```
# yarn add ts-node --dev
```
package.json에 다음의 내용 추가
```
"drop-schema": "ts-node drop-schema"
```

```
# local
npm run drop-schema

# dev
ts-node drop-schema-dev/test/prod
```
5. Deploy and Re-run server


## Migrate up from diff 
1. Create migration
```
npx mikro-orm migration:create
```

2. Deploy and Re-run server for up

## Migrate down - Only Test
1. migration down one step
```
npx mikro-orm migration:down
```

2. Deploy and Re-run server for up



## REST API - V1
```
a. Test 사이트에서 사용자 등록 및 API Key 요청 - 게임사
https://testnet.boaspace.io/

b. Test 사이트에서 아이템 생성 - 게임사

c. 등록된 사용자에게 API client Key 발급 - BoaSpace

d. API Playground 확인 - 게임사
https://api.dev.boaspace.io/api-docs

e. API 를 호출하여 사용 - 게임사
```


## Docker CMD
```

docker ps -a

docker images

docker system info

docker exec -it boa-space-backend sh

docker run -it bosagora/boa-space-backend:dev sh

docker logs boa-space-backend

docker logs --tail 30 -f  boa-space-backend

docker rm -vf $(docker ps -aq)

docker rmi -f $(docker images -aq)
```

