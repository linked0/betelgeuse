import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Seaport } from "pooh-land-js";
import { useEthers } from "@usedapp/core";
import { JsonRpcProvider } from "@ethersproject/providers/src.ts/json-rpc-provider";
import { CreateOrderInput } from "pooh-land-js/lib/types";
import { ItemType } from "pooh-land-js/lib/constants";
import { parseEther } from "ethers/lib/utils";

export const SEAPORT_ADDRESS = process.env.REACT_APP_SEAPORT_ADDRESS;
export const LAZY_MINT_ADAPTER = process.env.REACT_APP_LAZY_MINT_ADAPTER_ADDRESS;
export const ASSET_CONTRACT = process.env.REACT_APP_ASSET_CONTRACT_SHARED_ADDRESS;
export const WBOA9 = process.env.REACT_APP_WETH_ADDRESS;
export const PAYABLE_PROXY = process.env.REACT_APP_PAYABLE_PROXY_ADDRESS;
export const TOKEN_ID = process.env.REACT_APP_TOKEN_ID;
export const SERVICE_FEE: number = Number(process.env.REACT_APP_SERVICE_FEE) || NaN;

export interface SeaportContextProviderProps {
  children?: ReactNode;
}

interface SeaportContextValue {
  seaport: Seaport | undefined;
}
const defaultContext: SeaportContextValue = {
  seaport: undefined,
};
const SeaportContext = createContext<SeaportContextValue>(defaultContext);
export function SeaportContextProvider({ children }: SeaportContextProviderProps) {
  const [seaport, setSeaport] = useState<Seaport>();
  const { library } = useEthers();

  const active = useCallback(() => {
    if (library) {
      const seaport = new Seaport(library as JsonRpcProvider, {
        overrides: {
          contractAddress: SEAPORT_ADDRESS, // 테스트넷에 배포된 Seaport 컨트랙트 주소
          lazymintAdapterAddress: LAZY_MINT_ADAPTER, // 테스트넷에 배포된 SharedStorefrontLazyMintAdapter 컨트랙트 주소
          assetTokenAddress: ASSET_CONTRACT, // 테스트넷에 배포된 AssetContractShared 컨트랙트 주소
          wboaTokenAddress: WBOA9, // 테스트넷에 배포된 WBOA9 컨트랙트 주소
        },
      });
      setSeaport(seaport);
    }
  }, [setSeaport, library]);

  useEffect(() => {
    void active();
  }, [active]);

  return (
    <SeaportContext.Provider
      value={{
        seaport,
      }}
    >
      {children}
    </SeaportContext.Provider>
  );
}

export const useSeaport = () => useContext(SeaportContext);

export const createOrderInput = (
  account: string,
  tokenId: string,
  quantity: number,
  amount: string,
  startTime: number,
  endTime: number
): CreateOrderInput => {
  const input: CreateOrderInput = {
    allowPartialFills: true, // 부분 거래 허용 여부
    startTime: Math.floor(startTime / 1000).toString(), // 거래 시작 시간
    endTime: Math.floor(endTime / 1000).toString(), // 거래 종료 시간
    offer: [
      {
        itemType: ItemType.ERC1155, // 아이템 타입
        token: LAZY_MINT_ADAPTER, // 아이템 컨트랙트 주소
        amount: quantity.toString(), // 아이템 개수
        identifier: tokenId, // 아이템 토큰 아이디
      },
    ],
    consideration: [
      {
        amount: parseEther(amount.toString()).toString(), // Native Token(BOA) 개수
        recipient: account, // Native Token을 받을 대상
      },
    ],
  };
  return input;
};
