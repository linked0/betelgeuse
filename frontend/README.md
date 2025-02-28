# pooh-land-frontend

pooh/pooh-land-frontend

## Setup and run in local mode
#### env 파일 
```
cp .env.sample .env.dev
```
#### copy all contracts address to .env.dev file

#### .env.dev에 GraphQL 정보 세팅
```
REACT_APP_GRAPHQL="http://localhost:4000/graphql"
```

#### multicall address
- src/chains/AgoraChain.ts의 각 체인에 세팅되어야 함.
- 이것은 pooh-land 리파지토리에서 "yarn deploy:multicall:local"이나 "yarn deploy:multicall"로 설치
- multicallAddress 항목에 세팅

#### Web server 시작
```
yarn 
yarn start:dev
```

#### 주의
- Wallet connect가 잘 안될때는 브라우저 다시 실행
  - "CONNECT NETWORK" 버튼이 잘 안먹을 때가 있음.


## My

- `Profile Settings` /mysettings

## Collection

- `list` /collection/list
- `Create` /collection/create

## Asset

- `Create` /assets/create
- `Detail` /assets/detail
- `List for sale` /assets/sellPub

# Setup

```
npx create-react-app . --template redux-typescript
yarn add @usedapp/core ethers
yarn add @chakra-ui/react @emotion/react @emotion/styled framer-motion @metamask/jazzicon
yarn add @ethersproject/units
yarn add @apollo/client graphql
yarn add react-router-dom

yarn add eslint --dev
yarn run eslint --init
yarn add eslint-config-prettier eslint-plugin-prettier prettier --dev

.eslintrc
-------------------
"extends": [... , "plugin:prettier/recommended"]

.prettierrc
-------------------
{
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100
}

package.json
-------------------
-- scripts
"lint": "eslint .",
"lint:fix": "eslint --fix",
"format": "prettier --write './**/*.{js,jsx,ts,tsx,css,md,json}' --config ./.prettierrc"

-- dependencies to change
"@types/react": "^17.0.38",
```

## Run
```
yarn 
yarn start:dev
```

