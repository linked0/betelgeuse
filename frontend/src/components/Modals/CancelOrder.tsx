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
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import ThumbRatio from "../ThumbRatio";
import { useCancelCallback } from "../../hooks/useSeaportCallback";
import { LAZY_MINT_ADAPTER, useSeaport } from "../../hooks/useSeaport";
import { MarketEventType } from "../../type";
import { ApolloError } from "@apollo/client";
import { GetAssetDetailQueryGQL } from "../../hooks/query/useGetAssetDetailQuery";
import { useCreateEventMutation } from "../../hooks/mutation/createEventMutation";
import { useParams } from "react-router-dom";
import { formatEther } from "ethers/lib/utils";

interface ModalProp {
  isOpen: boolean;
  onClose(): void;
  asset?: any;
  orderData?: any;
  setOrderData?: any;
}
export const CancelOrder = ({ isOpen, onClose, asset, orderData, setOrderData }: ModalProp) => {
  const { seaport } = useSeaport();
  const { contract, tokenId } = useParams();
  const { createEventMutation } = useCreateEventMutation();
  const [retryVisible, setRetryVisible] = useState(false);
  const [order, setOrder] = useState<any>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const toast = useToast({
    position: "bottom-right",
    variant: "variant",
  });
  const {
    execute: listingCancel,
    isCancelled,
    transactionHash: cancelHash,
    receipt: cancelReceipt,
  } = useCancelCallback(orderData);

  const cancelCall = useCallback(
    (orderData: any) => {
      setOrder(orderData);
      setRetryVisible(false);
      if (orderData) {
        const { parameters: data } = JSON.parse(orderData.originalData);
        listingCancel(data)
          .then(() => {
            setLoading(true);
            // console.log("Transacting");
          })
          .catch(() => {
            setRetryVisible(true);
          });
      }
    },
    [setRetryVisible, listingCancel]
  );

  useEffect(() => {
    if (isOpen && orderData && !order) {
      cancelCall(orderData);
    }
  }, [isOpen, orderData, order, cancelCall]);

  useEffect(() => {
    if (isCancelled && order && cancelReceipt) {
      createEventMutation({
        variables: {
          eventData: JSON.stringify({
            assetId: asset.id,
            fromAddress: order.offerer.userAddress,
            proxyAddress: LAZY_MINT_ADAPTER,
            contractAddress: asset.assetContractAddress,
            transactionHash: cancelHash,
            eventType: MarketEventType.CANCEL_ORDER,
            orderId: order.id,
            error: "",
          }),
        },
        onCompleted(data: any) {
          setOrderData(undefined);
          setLoading(false);
          toast({
            title: "Successfully cancel listing",
            status: "success",
          });
          onClose();
          console.log("cancelEventMutation >:", data);
        },
        onError(err: ApolloError) {
          setLoading(false);
          console.log("cancelEventMutation > error:", err);
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
    order,
    isCancelled,
    cancelHash,
    cancelReceipt,
    asset,
    seaport,
    contract,
    tokenId,
    createEventMutation,
    onClose,
    setOrderData,
    toast,
  ]);

  return (
    <Modal blockScrollOnMount={true} isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent px={["15px", "15px", "15px", "25px"]}>
        <ModalHeader>
          <Heading variant="subtit22">
            {orderData?.offerType === "LISTING" ? "Cancel listing" : "Cancel offer"}
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH="400px">
          <Flex>
            <Stack direction="row" justify="flex-start" align="center" spacing="15px">
              <Box
                borderRadius="10px"
                width="65px"
                height="65px"
                background="L_Gray_T01"
                position="relative"
              >
                <ThumbRatio src={asset?.thumbnailUrl} isLoading={isLoading} />
              </Box>
              <Stack justify="flex-start" align="flex-start" spacing="0px">
                <Text variant="txt176" color="White">
                  {asset?.name}
                </Text>
                <Text variant="txt154" color="White" textAlign="left">
                  {asset?.assetCollection?.name}
                </Text>
              </Stack>
            </Stack>
            <Spacer />
            <Box textAlign="right">
              <Text variant="txt206" color="White" mt="10px">
                {orderData?.unitPrice && formatEther(orderData.unitPrice)} BOA
              </Text>
              {/*
              TODO : 달러 환산 기능
              <Text variant="txt154" color="text_Gray01">
                $1,286.79
              </Text>
              */}
            </Box>
          </Flex>
          <Divider mb="40px" borderColor="#443F5B" />
          <Box textAlign="left">
            <Text variant="txt176" color="White">
              Go to your wallet
            </Text>
            <Text variant="txt174" color="White">
              You will be asked to review and confirm this cancellation in your wallet.
            </Text>
          </Box>
        </ModalBody>
        <ModalFooter>
          {retryVisible && (
            <Button variant="primary" w="100%" mt="70px" onClick={() => cancelCall(orderData)}>
              Continue
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
