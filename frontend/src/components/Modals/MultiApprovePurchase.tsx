import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import ThumbRatio from "../ThumbRatio";
import { LAZY_MINT_ADAPTER, useSeaport } from "../../hooks/useSeaport";
import { useCreateEventMutation } from "../../hooks/mutation/createEventMutation";
import { useEthers } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";
import { BigNumber } from "ethers";
import { CartItem, removeCart } from "../../features/cart/cartSlice";
import { BOASPACE_DOMAIN } from "../../pages/temp/sdkSample";
import { getUSDPrice, useBOAPrice } from "../../features/price/boaPriceSlice";
import { useDispatch } from "react-redux";
import { MarketEventType } from "../../type";

interface ModalProp {
  isOpen: boolean;
  onClose(): void;
  assets: any;
  complete: any;
}
export const MultiApprovePurchase = ({ isOpen, onClose, assets, complete }: ModalProp) => {
  const { seaport } = useSeaport();
  const dispatch = useDispatch();
  const { createEventMutation } = useCreateEventMutation();
  const { account } = useEthers();
  const usd = useBOAPrice();
  const [retryVisible, setRetryVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { totalPrice } = useMemo(() => {
    if (assets && assets.length > 0) {
      return {
        totalPrice:
          assets?.reduce((total: BigNumber, item: any) => {
            return total.add(BigNumber.from(item.orderData.unitPrice));
          }, BigNumber.from(0)) ?? BigNumber.from(0),
      };
    }
    return {};
  }, [assets]);

  const listingFulfillHandler = useCallback(
    (data: any) => {
      if (!loading) {
        const orders = data.map((item: CartItem) => {
          return {
            order: JSON.parse(item.orderData.originalData),
            unitsToFill: item.orderData.amount,
          };
        });
        seaport
          .fulfillOrders({
            fulfillOrderDetails: orders,
            accountAddress: account,
            domain: BOASPACE_DOMAIN,
          })
          .then(({ actions }) => {
            const fulfillActions = actions[0];
            fulfillActions.transactionMethods
              .transact()
              .then((transaction) => {
                setLoading(true);
                transaction.wait().then((receipt) => {
                  data.forEach(async (d: any) => {
                    await createEventMutation({
                      variables: {
                        eventData: JSON.stringify({
                          assetId: d.asset.id,
                          fromAddress: d.orderData.offerer.userAddress,
                          proxyAddress: LAZY_MINT_ADAPTER,
                          contractAddress: d.asset.assetContractAddress,
                          transactionHash: receipt.transactionHash,
                          toAddress: receipt.from,
                          eventType: MarketEventType.MATCH_ORDER,
                          orderId: d.orderData.id,
                          amount: d.orderData.amount,
                        }),
                      },
                    });
                    dispatch(removeCart(d.orderData.id));
                  });
                  setLoading(false);
                  complete();
                });
              })
              .catch((reason) => {
                console.log("Catch:", reason);
                setRetryVisible(true);
              });
          })
          .catch((r) => {
            console.log("Metamask R:", r);
            const already = r
              .toString()
              .includes("The order you are trying to fulfill is already filled");
            if (already) {
              // TODO : 이미 체결된 거래 처리
              data.forEach((d: any) => {
                console.log("Remove Card : ", d.orderData.id);
                dispatch(removeCart(d.orderData.id));
              });
            }
          });
      }
    },
    [account, loading, complete, createEventMutation, dispatch, seaport]
  );

  const handlerRetry = useCallback(() => {
    setRetryVisible(false);
    listingFulfillHandler(assets);
  }, [assets, listingFulfillHandler, setRetryVisible]);

  useEffect(() => {
    if (isOpen && assets) {
      listingFulfillHandler(assets);
    } else {
      setRetryVisible(false);
      setLoading(false);
    }
  }, [isOpen, assets, listingFulfillHandler]);

  return (
    <Modal blockScrollOnMount={true} isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent maxW="700px" pl="0" pr="3px">
        <ModalHeader>
          <Heading variant="subtit22">Approve purchase</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody px="30px">
          <Box>
            <Flex>
              <Stack
                flexGrow="1"
                direction="row"
                justify="flex-start"
                align="center"
                spacing="15px"
                w="calc(100% - 50px)"
              >
                <Box borderRadius="10px" width="74px" height="74px" background="L_Gray_T01">
                  <ThumbRatio src={assets?.length && assets[0].originalUrl} isLoading={loading} />
                </Box>
                <Text variant="txt176" color="White" textAlign="left" whiteSpace="nowrap">
                  {assets.length} item
                </Text>
              </Stack>
              <Spacer />
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignContent="flex-end"
                textAlign="right"
              >
                <Text variant="txt206" color="White" whiteSpace="nowrap">
                  {totalPrice && formatEther(totalPrice)} BOA
                </Text>
                <Text variant="txt154" color="text_Gray01" whiteSpace="nowrap">
                  {totalPrice && getUSDPrice(totalPrice, usd)}
                </Text>
              </Box>
            </Flex>
            <Divider borderColor="popup_B01" mt="23px" mb="20px" />
            <Box textAlign="left" mt="23px">
              <Text variant="txt176" color="White">
                Go to your wallet
              </Text>
              <Text variant="txt174" color="White" lineHeight="23px">
                You’ll be asked to review and confirm this listing from your wallet.
              </Text>
            </Box>
            {retryVisible && (
              <Button variant="primary" w="100%" mt="54px" onClick={handlerRetry}>
                Continue
              </Button>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
