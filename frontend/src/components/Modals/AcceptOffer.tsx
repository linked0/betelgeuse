import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { createFulfillInput, useFulfillCallback } from "../../hooks/useSeaportCallback";
import { useEthers } from "@usedapp/core";
import { LAZY_MINT_ADAPTER, useSeaport } from "../../hooks/useSeaport";
import { MarketEventType } from "../../type";
import { ApolloError, MutationFunctionOptions } from "@apollo/client";
import { GetAssetDetailQueryGQL } from "../../hooks/query/useGetAssetDetailQuery";
import { useParams } from "react-router-dom";
import { useCreateEventMutation } from "../../hooks/mutation/createEventMutation";
import ThumbRatio from "../ThumbRatio";
import { formatEther } from "@ethersproject/units";

interface AcceptOfferProps {
  isOpen: boolean;
  onClose(): void;
  asset?: any;
  orderData?: any;
  collectionName?: string;
  listingPrice?: string;
  retry?: any;
  isSuccess?: boolean;
  viewListing?: any;
}
enum AcceptStep {
  STEP_1_LOW_AGREE,
  STEP_2_ACCEPT_OFFER,
  STEP_3_WALLET_WAITING,
}
export const AcceptOffer = (props: AcceptOfferProps) => {
  const { isOpen, onClose, asset, orderData } = props;
  const [retryVisible, setRetryVisible] = useState(false);
  const { account } = useEthers();
  const { seaport } = useSeaport();
  const { contract, tokenId } = useParams();
  const { createEventMutation } = useCreateEventMutation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(AcceptStep.STEP_1_LOW_AGREE);

  useEffect(() => {
    setStep(AcceptStep.STEP_1_LOW_AGREE);
  }, [orderData]);

  const {
    execute: offerFulfill,
    // isFulfill: isOfferFulfill,
    transactionHash: offerFulfillHash,
    receipt: offerFulfillReceipt,
  } = useFulfillCallback(asset);

  const callEvent = useCallback(
    (options?: MutationFunctionOptions) => {
      createEventMutation(options);
    },
    [createEventMutation]
  );

  const offererFulfillHandler = useCallback(
    (data: any) => {
      if (offerFulfill && !loading) {
        const originalData = JSON.parse(data.originalData);
        const fulfillInput = createFulfillInput(originalData, data.amount, account);
        offerFulfill(fulfillInput)
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
              console.log("??????????");
              //TODO : 3STEP 이외의 단계에선 비활성화
              setRetryVisible(true);
            }
          });
      } else {
        console.log("fulfill is null");
      }
    },
    [account, offerFulfill, loading]
  );

  useEffect(() => {
    if (orderData && offerFulfillReceipt && loading) {
      console.log("isOfferFulfill complete effect execute", offerFulfillReceipt);
      callEvent({
        variables: {
          eventData: JSON.stringify({
            assetId: asset.id,
            fromAddress: offerFulfillReceipt.from,
            proxyAddress: LAZY_MINT_ADAPTER,
            contractAddress: asset.assetContractAddress,
            transactionHash: offerFulfillHash,
            toAddress: orderData.offerer.userAddress,
            eventType: MarketEventType.MATCH_ORDER,
            orderId: orderData.id,
            amount: 1,
          }),
        },
        onCompleted(data: any) {
          setLoading(false);
          onClose();
          // complete();
          console.log("offerFulfillEventMutation >:", data);
        },
        onError(err: ApolloError) {
          console.log("offerFulfillEventMutation > error:", err);
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
    offerFulfillReceipt,
    asset,
    seaport,
    orderData,
    contract,
    offerFulfillHash,
    tokenId,
    onClose,
  ]);

  const handlerRetry = useCallback(() => {
    setRetryVisible(false);
    offererFulfillHandler(orderData);
  }, [offererFulfillHandler, setRetryVisible, orderData]);

  useEffect(() => {
    if (step === AcceptStep.STEP_3_WALLET_WAITING) {
      offererFulfillHandler(orderData);
    }
  }, [step, offererFulfillHandler, orderData]);

  useEffect(() => {
    if (!isOpen) {
      setStep(AcceptStep.STEP_1_LOW_AGREE);
      setRetryVisible(false);
    }
  }, [isOpen]);

  return (
    <Modal blockScrollOnMount={true} isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent px={["15px", "15px", "15px", "25px"]}>
        <ModalHeader>
          {step === AcceptStep.STEP_1_LOW_AGREE ? (
            <Heading variant="subtit22">Accept low offer?</Heading>
          ) : (
            <Heading variant="subtit22">Accept offer</Heading>
          )}
        </ModalHeader>
        <ModalCloseButton />

        {step === AcceptStep.STEP_1_LOW_AGREE && (
          <LowOfferBody
            onAccept={() => setStep(AcceptStep.STEP_2_ACCEPT_OFFER)}
            onCancel={() => onClose()}
          />
        )}
        {step === AcceptStep.STEP_2_ACCEPT_OFFER && (
          <AcceptOfferInfoBody
            onAccept={() => setStep(AcceptStep.STEP_3_WALLET_WAITING)}
            asset={asset}
            orderData={orderData}
          />
        )}
        {step === AcceptStep.STEP_3_WALLET_WAITING && (
          <TransactionWaitingBody
            assetName={asset?.name}
            assetUrl={asset?.thumbnailUrl}
            collectionName={asset?.assetCollection?.name}
            amount={orderData?.unitPrice}
            amountType={AmountType.TOKEN}
            isLoading={loading}
          />
        )}

        <ModalFooter>
          {retryVisible && (
            <Button variant="primary" w="100%" mt="70px" onClick={handlerRetry}>
              Continue
            </Button>
          )}
          {/*{isSuccess && (*/}
          {/*  <Button variant="primary" w="100%" mt="70px" onClick={viewListing}>*/}
          {/*    View listing*/}
          {/*  </Button>*/}
          {/*)}*/}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface AcceptOfferInfoBodyProps {
  asset?: any;
  orderData?: any;
  onAccept?: () => void;
}
export function AcceptOfferInfoBody({ onAccept, asset, orderData }: AcceptOfferInfoBodyProps) {
  return (
    <ModalBody>
      {/* type1 */}
      <Stack divider={<StackDivider borderColor="popup_B01" />} spacing="20px">
        <Flex>
          <Stack
            flexGrow="1"
            direction="row"
            justify="flex-start"
            align="center"
            spacing="15px"
            w="calc(100% - 50px)"
          >
            <Box
              overflow="hidden"
              borderRadius="10px"
              width="74px"
              height="74px"
              background="L_Gray_T01"
            >
              <ThumbRatio />
            </Box>
            <Box>
              <Text variant="txt176" color="White" textAlign="left" whiteSpace="nowrap">
                {asset?.name}
              </Text>
              <Text variant="txt154" mt="5px" color="text_Gray01" whiteSpace="nowrap">
                Expires in 8 days
              </Text>
            </Box>
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
              {orderData?.unitPrice && formatEther(orderData.unitPrice)} BOA
            </Text>
            <Text variant="txt154" mt="5px" color="text_Gray01" whiteSpace="nowrap">
              $-,---.--
            </Text>
          </Box>
        </Flex>
        <Flex align="flex-end">
          <Box textAlign="left">
            <Text variant="txt186" color="White">
              Offer details
            </Text>
            <Text variant="txt174" color="text_Gray02">
              Floor difference
            </Text>
            <Text variant="txt174" color="text_Gray02">
              From
            </Text>
            <Text variant="txt174" color="text_Gray02">
              Expiration
            </Text>
          </Box>
          <Spacer />
          <Box textAlign="right">
            <Text variant="txt174" color="text_Gray02">
              100% below
            </Text>
            <Text variant="txt176" color="Secondary_V">
              007F22
            </Text>
            <Text variant="txt174" color="text_Gray02">
              in 3 days
            </Text>
          </Box>
        </Flex>
        <Flex align="flex-end">
          <Box textAlign="left">
            <Text variant="txt186" color="White">
              Fees
            </Text>
            <Text variant="txt174" color="text_Gray02">
              Service fee
            </Text>
            <Text variant="txt174" color="text_Gray02">
              Creator earnings
            </Text>
          </Box>
          <Spacer />
          <Box textAlign="right">
            <Text variant="txt176" color="#00A5BC">
              <Text
                as="span"
                variant="txt174"
                mr="10px"
                color="text_Gray02"
                textDecor="line-through"
              >
                2.50%
              </Text>
              0.00%
            </Text>
            <Text variant="txt174" color="text_Gray02">
              0%
            </Text>
          </Box>
        </Flex>
        <Flex>
          <Box textAlign="left">
            <Text variant="txt186" color="White">
              Total earnings
            </Text>
          </Box>
          <Spacer />
          <Box textAlign="right">
            <Text variant="txt186" color="White">
              0.0000009 BOA
            </Text>
            <Text variant="txt174" color="text_Gray02">
              0%
            </Text>
          </Box>
        </Flex>
      </Stack>
      <Button variant="primary" w="100%" mt="54px" onClick={onAccept}>
        Accept
      </Button>
    </ModalBody>
  );
}

interface LowOfferBodyProps {
  onCancel?: () => void;
  onAccept?: () => void;
}
export function LowOfferBody({ onAccept, onCancel }: LowOfferBodyProps) {
  return (
    <ModalBody maxH="400px">
      <Text variant="txt174" color="text_Gray02">
        This offer is 100% below the floor price for this collection.
      </Text>
      <HStack spacing="20px" mt="50px">
        <Button variant="outline" color="Secondary_V" flexGrow="1" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" flexGrow="1" onClick={onAccept}>
          Accept offer
        </Button>
      </HStack>
    </ModalBody>
  );
}

interface TransactionWaitingModalBodyProps {
  assetName: string;
  assetUrl: string;
  collectionName: string;
  amount: string;
  amountType?: AmountType;
  isLoading?: boolean;
}
export enum AmountType {
  COIN,
  TOKEN,
}

export function TransactionWaitingBody({
  assetName = "",
  assetUrl = "",
  collectionName = "",
  amount = "0",
  amountType = AmountType.COIN,
  isLoading = false,
}: TransactionWaitingModalBodyProps) {
  return (
    <ModalBody>
      <Flex>
        <Stack direction="row" justify="flex-start" align="center" spacing="15px">
          <Box borderRadius="10px" width="65px" height="65px" background="L_Gray_T01">
            <ThumbRatio src={assetUrl} isLoading={isLoading} />
          </Box>
          <Stack justify="flex-start" align="flex-start" spacing="0px">
            <Text variant="txt176" color="White">
              {assetName}
            </Text>
            <Text variant="txt154" color="White" textAlign="left">
              {collectionName}
            </Text>
          </Stack>
        </Stack>
        <Spacer />
        <Box textAlign="right">
          <Text variant="txt206" color="White" mt="10px">
            {formatEther(amount).toString() + (amountType === AmountType.COIN) ? " BOA" : " WBOA"}
          </Text>
          <Text variant="txt154" color="text_Gray01">
            $-,---.--
          </Text>
        </Box>
      </Flex>
      <Divider mb="40px" borderColor="#443F5B" />
      <Box textAlign="left">
        <Text variant="txt176" color="White">
          Go to your wallet
        </Text>
        <Text variant="txt174" color="White">
          You’ll be asked to review and confirm this listing from your wallet.
        </Text>
      </Box>
    </ModalBody>
  );
}
