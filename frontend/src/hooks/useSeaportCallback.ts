import {
  CreateOrderInput,
  InputCriteria,
  OrderComponents,
  OrderWithCounter,
  TipInputItem,
} from "pooh-land-js/lib/types";
import { useSeaport } from "./useSeaport";
import { useEthers } from "@usedapp/core";
import { useActiveState } from "./useActiveState";
import { ACTIVE_STATE } from "../constants";
import { useEffect, useMemo, useState } from "react";
import { BigNumberish, ContractReceipt, ContractTransaction } from "ethers";
import { BOASPACE_DOMAIN } from "../utils/SignedData";

export type CreateOrderResult = {
  order: OrderWithCounter;
  orderHash: string;
};

export function useCreateOrderCallback(): {
  execute?: undefined | ((orderInput: CreateOrderInput) => Promise<CreateOrderResult>);
} {
  const { account, chainId } = useEthers();
  const { seaport } = useSeaport();
  const { activeState } = useActiveState();

  return useMemo(() => {
    if (activeState !== ACTIVE_STATE.STATUS_ONLINE) {
      return {};
    } else if (seaport && account && chainId) {
      return {
        execute: async (orderInput: CreateOrderInput) => {
          const { actions, executeAllActions } = await seaport.createOrder(orderInput, account);
          console.log("actions:", JSON.stringify(actions));
          const order = await executeAllActions();
          const orderHash = seaport.getOrderHash(order.parameters);
          return { order, orderHash };
        },
      };
    } else {
      return {};
    }
  }, [activeState, chainId, seaport, account]);
}

export function useCancelCallback(asset: any): {
  execute?: undefined | ((orderParameters: OrderComponents) => Promise<ContractTransaction>);
  isCancelled?: boolean;
  transactionHash?: string;
  orderHash?: string;
  receipt?: ContractReceipt;
} {
  const { seaport } = useSeaport();
  const { activeState } = useActiveState();
  const [tx, setTx] = useState(undefined);
  const [isCancelled, setCancelled] = useState(false);
  const [orderHash, setOrderHash] = useState(undefined);
  const [receipt, setReceipt] = useState(undefined);

  useEffect(() => {
    setTx(undefined);
    setCancelled(false);
    setReceipt(undefined);
    setOrderHash(undefined);
  }, [asset]);

  return useMemo(() => {
    if (activeState !== ACTIVE_STATE.STATUS_ONLINE) {
      return {};
    } else {
      return {
        //Either include them or remove the dependency array
        execute: async (orderParameter: OrderComponents) => {
          setOrderHash(seaport.getOrderHash(orderParameter));
          const tx = await seaport.cancelOrders([orderParameter]).transact();
          setTx(tx);
          tx.wait().then((receipt: ContractReceipt) => {
            console.log("cancel complete > receipt:", receipt);
            setReceipt(receipt);
            setCancelled(true);
          });
          return tx;
        },
        isCancelled: isCancelled,
        transactionHash: tx ? tx.hash : undefined,
        orderHash: orderHash,
        receipt: receipt,
      };
    }
  }, [seaport, activeState, isCancelled, tx, orderHash, receipt]);
}

export function useFulfillCallback(asset: any): {
  execute?:
    | undefined
    | ((fulfillInput: {
        order: OrderWithCounter;
        unitsToFill?: BigNumberish;
        offerCriteria?: InputCriteria[];
        considerationCriteria?: InputCriteria[];
        tips?: TipInputItem[];
        extraData?: string;
        accountAddress?: string;
        conduitKey?: string;
        recipientAddress?: string;
        domain?: string;
      }) => Promise<ContractTransaction>);
  transactionHash?: string | undefined;
  isFulfill?: boolean;
  receipt?: ContractReceipt;
} {
  const { account, chainId } = useEthers();
  const { seaport } = useSeaport();
  const { activeState } = useActiveState();
  const [tx, setTx] = useState(undefined);
  const [isFulfill, setFulfill] = useState(false);
  const [receipt, setReceipt] = useState(undefined);

  useEffect(() => {
    setTx(undefined);
    setFulfill(false);
    setReceipt(undefined);
  }, [asset]);

  return useMemo(() => {
    if (activeState !== ACTIVE_STATE.STATUS_ONLINE) {
      return {};
    } else if (seaport && account && chainId) {
      return {
        execute: async (fulfillInput: any) => {
          const { actions } = await seaport.fulfillOrder(fulfillInput);
          const fulfillAction = actions[0];
          const tx = await fulfillAction.transactionMethods.transact();
          setTx(tx);
          tx.wait().then((receipt: ContractReceipt) => {
            console.log("fulfill complete > receipt:", receipt);
            setReceipt(receipt);
            setFulfill(true);
          });
          return tx;
        },
        transactionHash: tx ? tx.hash : undefined,
        isFulfill: isFulfill,
        receipt: receipt,
      };
    } else {
      return {};
    }
  }, [activeState, chainId, seaport, account, isFulfill, tx, receipt]);
}

/**
 *
 * @param order Order data : Parameter
 * @param unitsToFill 구매 갯수
 * @param accountAddress 구매자 Address
 * @param domain
 */
export function createFulfillInput(
  order: OrderWithCounter,
  unitsToFill: number,
  accountAddress: string,
  domain?: string
) {
  return {
    order,
    unitsToFill,
    accountAddress,
    domain: domain ?? BOASPACE_DOMAIN,
  };
}
