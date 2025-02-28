import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  StackDivider,
  VStack,
} from "@chakra-ui/react";
import { Formik, FormikErrors } from "formik";
import DatePicker from "../../components/DatePicker/DatePicker";
import { useEthers } from "@usedapp/core";
import { useSeaport } from "../../hooks/useSeaport";
import { ItemType } from "pooh-land-js/lib/constants";
import { parseEther } from "ethers/lib/utils";
import { OrderWithCounter } from "pooh-land-js/lib/types";
import { useCreateOrderMutation } from "../../hooks/mutation/createOrderMutation";
import { ApolloError, MutationFunctionOptions } from "@apollo/client";
import {
  CreateOrderResult,
  useCancelCallback,
  useCreateOrderCallback,
} from "../../hooks/useSeaportCallback";
import { ORDER_TYPE } from "../../constants";
import { useCreateEventMutation } from "../../hooks/mutation/createEventMutation";
import {
  GetAssetDetailQueryGQL,
  useGetAssetDetailQuery,
} from "../../hooks/query/useGetAssetDetailQuery";

interface FormValues {
  address: string;
  tokenId: string;
  quantity: number;
  amount: string;
  startTime: number;
  endTime: number;
}

export const LAZY_MINT_ADAPTER = process.env.REACT_APP_LAZY_MINT_ADAPTER_ADDRESS;

export default function ListForSale() {
  const { contract, tokenId } = useParams();
  const { account } = useEthers();
  const { seaport } = useSeaport();
  const { createOrderMutation } = useCreateOrderMutation();
  const { createEventMutation } = useCreateEventMutation();
  const [orderData, setOrderData] = useState<OrderWithCounter>(null);
  const [orderId, setOrderId] = useState();

  const assetDetailData = useGetAssetDetailQuery(contract, tokenId);

  const { asset, assetCollection, assetContract, orders, owners } = useMemo(() => {
    console.log("assetDetail", assetDetailData);
    if (assetDetailData && assetDetailData?.GetAssetDetail) {
      return {
        asset: assetDetailData.GetAssetDetail,
        assetCollection: assetDetailData.GetAssetDetail.assetCollection,
        assetContract: assetDetailData.GetAssetDetail.assetContract,
        orders: assetDetailData.GetAssetDetail.orders,
        owners: assetDetailData.GetAssetDetail.owners,
      };
    }
    return {};
  }, [assetDetailData]);

  useEffect(() => {
    console.log(assetCollection, assetContract, orders, owners);
  }, [assetCollection, assetContract, orders, owners]);

  const { execute: listingCall } = useCreateOrderCallback();

  const {
    execute: listingCancel,
    isCancelled,
    transactionHash,
  } = useCancelCallback(assetDetailData);

  const callEvent = useCallback(
    (options?: MutationFunctionOptions) => {
      if (!transactionHash) return;
      createEventMutation(options);
    },
    [createEventMutation, transactionHash]
  );

  useEffect(() => {
    if (isCancelled) {
      console.log("Cancel complete");
      callEvent({
        variables: {
          eventData: JSON.stringify({
            assetId: asset.id,
            userAddress: account,
            proxyAddress: LAZY_MINT_ADAPTER,
            contractAddress: asset.assetContractAddress,
            transactionHash: transactionHash,
            eventType: "CancelOrder",
            orderId: orderId,
            error: "",
          }),
        },
        onCompleted(data: any) {
          console.log("createEventMutation >:", data);
        },
        onError(err: ApolloError) {
          console.log("createEventMutation > error:", err);
        },
      });
    }
  }, [isCancelled, callEvent, account, asset, seaport, orderId, transactionHash]);

  const cancelOrder = async () => {
    if (!orderData) return;
    await listingCancel(orderData.parameters);
  };

  return (
    <React.Fragment>
      <Box width="100%" borderRadius="lg" p={10} shadow="base">
        <Heading mb={["36px"]}>List For Sale</Heading>
        <VStack width="100%" align="stretch" spacing={10}>
          <HStack spacing={10} divider={<StackDivider borderColor="gray.200" />}>
            <Box width="100%">
              <Formik
                initialValues={{
                  address: account,
                  tokenId: asset?.tokenId ?? "",
                  quantity: 1,
                  amount: "0.1",
                  startTime: 0,
                  endTime: 0,
                }}
                onSubmit={(values: FormValues) => {
                  const param = { ...values, tokenId: asset.tokenId, address: account };
                  listingCall({
                    allowPartialFills: true, // 부분 거래 허용 여부
                    startTime: Math.floor(param.startTime / 1000).toString(), // 거래 시작 시간
                    endTime: Math.floor(param.endTime / 1000).toString(), // 거래 종료 시간
                    offer: [
                      {
                        itemType: ItemType.ERC1155, // 아이템 타입
                        token: LAZY_MINT_ADAPTER, // 아이템 컨트랙트 주소
                        amount: param.quantity.toString(), // 아이템 개수
                        identifier: asset.tokenId.toString(), // 아이템 토큰 아이디
                      },
                    ],
                    consideration: [
                      {
                        amount: parseEther(param.amount.toString()).toString(), // Native Token(BOA) 개수
                        recipient: account, // Native Token을 받을 대상
                      },
                    ],
                  }).then(({ order, orderHash }: CreateOrderResult) => {
                    setOrderData(order);
                    console.log("OrderData", order);
                    createOrderMutation({
                      variables: {
                        originalData: JSON.stringify(order),
                        assetId: asset.id,
                        orderHash,
                        offerType: ORDER_TYPE.LISTING,
                      },
                      onCompleted(data: any) {
                        console.log("createOrderMutation >:", data);
                        setOrderId(data.createOrder.id);
                      },
                      onError(err: ApolloError) {
                        console.log("createOrderMutation > error:", err);
                      },
                      refetchQueries: [
                        {
                          query: GetAssetDetailQueryGQL,
                          variables: { assetContractAddress: contract, tokenId },
                        },
                      ],
                    });
                  });
                }}
                validate={(values: FormValues) => {
                  let errors: FormikErrors<FormValues> = {};
                  errors = {};
                  if (!values.quantity) {
                    errors.quantity = "Please enter the quantity required.";
                  } else if (!values.amount) {
                    errors.amount = "Please enter the address required.";
                  } else if (!values.startTime || !values.endTime) {
                    errors.startTime = "Please select the duration required.";
                  }
                  return errors;
                }}
              >
                {(props) => (
                  <form onSubmit={props.handleSubmit}>
                    <VStack spacing={10} align="stretch">
                      <FormControl isInvalid={!!props.errors.quantity && !!props.touched.quantity}>
                        <FormLabel>Quantity</FormLabel>
                        <Input
                          id="quantity"
                          type="number"
                          name="quantity"
                          placeholder="Quantity"
                          onChange={props.handleChange}
                          value={props.values.quantity}
                        />
                        <FormErrorMessage>
                          <FormHelperText
                            mt={"16px"}
                            fontSize={["15px", "15px", "14px"]}
                            fontWeight="400"
                            lineHeight="12px"
                            color="#ff204a"
                          >
                            {props.errors.quantity}
                          </FormHelperText>
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!props.errors.amount && !!props.touched.amount}>
                        <FormLabel>Set a price</FormLabel>
                        <Input
                          id="amount"
                          type="number"
                          name="amount"
                          placeholder="Amount"
                          onChange={props.handleChange}
                          value={props.values.amount}
                        />
                        <FormErrorMessage>
                          <FormHelperText
                            mt={"16px"}
                            fontSize={["15px", "15px", "14px"]}
                            fontWeight="400"
                            lineHeight="12px"
                            color="#ff204a"
                          >
                            {props.errors.amount}
                          </FormHelperText>
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl
                        isInvalid={!!props.errors.startTime && !!props.touched.startTime}
                      >
                        <FormLabel>Set duration</FormLabel>
                        <DatePicker
                          id="duration"
                          name="duration"
                          onChange={(dates: any) => {
                            const { start, end } = dates;
                            if (start.getTime() !== props.getFieldProps("startTime").value) {
                              props.setFieldValue("startTime", dates.start.getTime(), false);
                            }
                            if (end.getTime() !== props.getFieldProps("endTime").value) {
                              props.setFieldValue("endTime", dates.end.getTime(), false);
                            }
                          }}
                        />

                        <FormErrorMessage>
                          <FormHelperText
                            mt={"16px"}
                            fontSize={["15px", "15px", "14px"]}
                            fontWeight="400"
                            lineHeight="12px"
                            color="#ff204a"
                          >
                            {props.errors.startTime}
                          </FormHelperText>
                        </FormErrorMessage>
                      </FormControl>
                      <Button
                        colorScheme="blue"
                        bg="blue.400"
                        color="white"
                        _hover={{
                          bg: "blue.500",
                        }}
                        w="100%"
                        type="submit"
                      >
                        Complete listing
                      </Button>
                      {orderData && (
                        <>
                          <Button
                            colorScheme="blue"
                            bg="blue.400"
                            color="white"
                            _hover={{
                              bg: "blue.500",
                            }}
                            w="100%"
                            type="button"
                            onClick={cancelOrder}
                          >
                            Cancel listing
                          </Button>
                        </>
                      )}
                    </VStack>
                  </form>
                )}
              </Formik>
            </Box>
            <Box w="50%">
              <Image src={asset?.thumbnailUrl} alt={asset?.name} />
              <p>{asset?.name}</p>
              <p>Desc: {asset?.description}</p>
              <p>TokenID: {asset?.tokenId}</p>
              <p>totalSupply: {asset?.totalSupply}</p>
              <p>contract address: {asset?.assetContractAddress}</p>
            </Box>
          </HStack>
        </VStack>
      </Box>
    </React.Fragment>
  );
}
