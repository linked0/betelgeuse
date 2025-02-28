import React, { useCallback, useEffect, useState } from "react";
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
import { createFulfillInput, useFulfillCallback } from "../../hooks/useSeaportCallback";
import { MarketEventType } from "../../type";
import { ApolloError, MutationFunctionOptions } from "@apollo/client";
import { GetAssetDetailQueryGQL } from "../../hooks/query/useGetAssetDetailQuery";
import { useParams } from "react-router-dom";
import { LAZY_MINT_ADAPTER, useSeaport } from "../../hooks/useSeaport";
import { useCreateEventMutation } from "../../hooks/mutation/createEventMutation";
import { useEthers } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";

interface ModalProp {
  isOpen: boolean;
  onClose(): void;
  asset: any;
  orderData: any;
  complete: any;
}
export const ApprovePurchase = ({ isOpen, onClose, asset, orderData, complete }: ModalProp) => {
  const { seaport } = useSeaport();
  const { contract, tokenId } = useParams();
  const { createEventMutation } = useCreateEventMutation();
  const { account } = useEthers();
  const [retryVisible, setRetryVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    execute: fulfill,
    transactionHash: fulfillHash,
    receipt: fulfillReceipt,
  } = useFulfillCallback(asset);

  const callEvent = useCallback(
    (options?: MutationFunctionOptions) => {
      createEventMutation(options);
    },
    [createEventMutation]
  );

  const listingFulfillHandler = useCallback(
    (data: any) => {
      if (fulfill && !loading) {
        const originalData = JSON.parse(data.originalData);
        const fulfillInput = createFulfillInput(originalData, data.amount, account);
        fulfill(fulfillInput)
          .then(() => {
            setLoading(true);
          })
          .catch((reason) => {
            const already = reason
              .toString()
              .includes("The order you are trying to fulfill is already filled");
            if (already) {
              // TODO : 이미 체결된 거래 처리
              console.log("Metamask:", reason);
            } else {
              setRetryVisible(true);
            }
          });
      }
    },
    [account, fulfill, loading]
  );

  useEffect(() => {
    if (orderData && fulfillReceipt && loading) {
      console.log("isFulfill complete effect execute");
      callEvent({
        variables: {
          eventData: JSON.stringify({
            assetId: asset.id,
            fromAddress: orderData.offerer.userAddress,
            proxyAddress: LAZY_MINT_ADAPTER,
            contractAddress: asset.assetContractAddress,
            transactionHash: fulfillHash,
            toAddress: fulfillReceipt.from,
            eventType: MarketEventType.MATCH_ORDER,
            orderId: orderData.id,
            amount: orderData.amount,
          }),
        },
        onCompleted(data: any) {
          setLoading(false);
          onClose();
          complete();
          console.log("fulfillEventMutation >:", data);
        },
        onError(err: ApolloError) {
          console.log("fulfillEventMutation > error:", err);
        },
        refetchQueries: [
          {
            query: GetAssetDetailQueryGQL,
            variables: { assetContractAddress: contract, tokenId },
          },
        ],
      });
    }
  }, [
    loading,
    callEvent,
    fulfillReceipt,
    asset,
    seaport,
    orderData,
    contract,
    fulfillHash,
    tokenId,
    fulfill,
    onClose,
    setLoading,
    complete,
  ]);

  const handlerRetry = useCallback(() => {
    setRetryVisible(false);
    listingFulfillHandler(orderData);
  }, [orderData, listingFulfillHandler, setRetryVisible]);

  useEffect(() => {
    if (isOpen && orderData) {
      listingFulfillHandler(orderData);
    } else {
      setRetryVisible(false);
      setLoading(false);
    }
  }, [isOpen, orderData, listingFulfillHandler]);

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
                  <ThumbRatio src={asset?.originalUrl} isLoading={loading} />
                </Box>
                <Text variant="txt176" color="White" textAlign="left" whiteSpace="nowrap">
                  {orderData?.amount} item
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
                  {orderData?.unitPrice && formatEther(orderData?.unitPrice)} BOA
                </Text>
                <Text variant="txt154" color="text_Gray01" whiteSpace="nowrap">
                  $-,---.--
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
