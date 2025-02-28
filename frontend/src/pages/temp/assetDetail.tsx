import React, { ReactElement, useCallback, useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  GetAssetDetailQueryGQL,
  useGetAssetDetailQuery,
} from "../../hooks/query/useGetAssetDetailQuery";
import { formatDistance } from "date-fns";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { useEthers } from "@usedapp/core";
import { shotAddress } from "../../utils/WalletUtils";
import {
  createFulfillInput,
  useCancelCallback,
  useFulfillCallback,
} from "../../hooks/useSeaportCallback";
import { ApolloError, MutationFunctionOptions } from "@apollo/client";
import { useCreateEventMutation } from "../../hooks/mutation/createEventMutation";
import { LAZY_MINT_ADAPTER, useSeaport } from "../../hooks/useSeaport";
import { OrderWithCounter } from "pooh-land-js/lib/types";
import { WaitingModal } from "../../components/Modals/Waitting";
import { InfoIcon } from "@chakra-ui/icons";
import { ActivityType, MarketEventType, OrderStatus } from "../../type";
import { MakeOffer } from "../../components/Modals/MakeOffer";

export default function AssetDetail() {
  const { account } = useEthers();
  const { contract, tokenId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { seaport } = useSeaport();
  const { createEventMutation } = useCreateEventMutation();
  const assetDetailData = useGetAssetDetailQuery(contract, tokenId);
  const [order, setOrder] = useState(undefined);
  const waitingModal = useDisclosure();
  const makeOfferModal = useDisclosure();

  const { asset, activities, listings, offers } = useMemo(() => {
    console.log("assetDetail", assetDetailData);
    if (assetDetailData && assetDetailData?.GetAssetDetail) {
      return {
        asset: assetDetailData.GetAssetDetail,
        activities: assetDetailData.GetAssetDetail.activities,
        assetCollection: assetDetailData.GetAssetDetail.assetCollection,
        assetContract: assetDetailData.GetAssetDetail.assetContract,
        listings: assetDetailData.GetAssetDetail.activities
          .filter((active: any) => active.activityType === "LIST")
          .map((active: any) => active.order),
        offers: assetDetailData.GetAssetDetail.activities
          .filter((active: any) => active.activityType === "OFFER")
          .map((active: any) => active.order),
        owners: assetDetailData.GetAssetDetail.owners,
      };
    }
    return {};
  }, [assetDetailData]);

  const handlerOnSellClick = () => {
    navigate(location.pathname + "/sellTemp");
  };

  const {
    execute: listingCancel,
    isCancelled,
    transactionHash: cancelHash,
    receipt: cancelReceipt,
  } = useCancelCallback(assetDetailData);

  const {
    execute: fulfill,
    isFulfill,
    transactionHash: fulfillHash,
    receipt: fulfillReceipt,
  } = useFulfillCallback(assetDetailData);

  const {
    execute: offerFulfill,
    isFulfill: isOfferFulfill,
    transactionHash: offerFulfillHash,
    receipt: offerFulfillReceipt,
  } = useFulfillCallback(assetDetailData);

  const callEvent = useCallback(
    (options?: MutationFunctionOptions) => {
      createEventMutation(options);
    },
    [createEventMutation]
  );

  useEffect(() => {
    if (isFulfill && order && fulfillReceipt) {
      setOrder(undefined);
      console.log("isFulfill complete effect execute");
      waitingModal.onClose();
      callEvent({
        variables: {
          eventData: JSON.stringify({
            assetId: asset.id,
            fromAddress: order.offerer.userAddress,
            proxyAddress: LAZY_MINT_ADAPTER,
            contractAddress: asset.assetContractAddress,
            transactionHash: fulfillHash,
            toAddress: fulfillReceipt.from,
            eventType: MarketEventType.MATCH_ORDER,
            orderId: order.id,
            amount: 1,
          }),
        },
        onCompleted(data: any) {
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
    isFulfill,
    callEvent,
    fulfillReceipt,
    asset,
    seaport,
    order,
    contract,
    fulfillHash,
    tokenId,
    waitingModal,
  ]);

  useEffect(() => {
    if (isOfferFulfill && order && offerFulfillReceipt) {
      setOrder(undefined);
      console.log("isOfferFulfill complete effect execute", offerFulfillReceipt);
      waitingModal.onClose();
      callEvent({
        variables: {
          eventData: JSON.stringify({
            assetId: asset.id,
            fromAddress: offerFulfillReceipt.from,
            proxyAddress: LAZY_MINT_ADAPTER,
            contractAddress: asset.assetContractAddress,
            transactionHash: offerFulfillHash,
            toAddress: order.offerer.userAddress,
            eventType: MarketEventType.MATCH_ORDER,
            orderId: order.id,
            amount: 1,
          }),
        },
        onCompleted(data: any) {
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
    isOfferFulfill,
    callEvent,
    offerFulfillReceipt,
    asset,
    seaport,
    order,
    contract,
    offerFulfillHash,
    tokenId,
    waitingModal,
  ]);

  useEffect(() => {
    if (isCancelled && order && cancelReceipt) {
      setOrder(undefined);
      console.log("Cancel complete effect execute");
      waitingModal.onClose();
      callEvent({
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
          console.log("cancelEventMutation >:", data);
        },
        onError(err: ApolloError) {
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
    isCancelled,
    callEvent,
    cancelHash,
    cancelReceipt,
    asset,
    seaport,
    order,
    contract,
    tokenId,
    waitingModal,
  ]);

  const listingFulfillHandler = useCallback(
    (data: OrderWithCounter) => {
      if (fulfill) {
        const fulfillInput = createFulfillInput(data, 1, account);
        fulfill(fulfillInput);
      } else {
        console.log("fulfill is null");
      }
    },
    [account, fulfill]
  );

  const offererFulfillHandler = useCallback(
    (data: OrderWithCounter, units: number) => {
      if (offerFulfill) {
        const fulfillInput = createFulfillInput(data, units, account);
        offerFulfill(fulfillInput);
      } else {
        console.log("fulfill is null");
      }
    },
    [account, offerFulfill]
  );

  const getEventType = (type: ActivityType): ReactElement => {
    if (type === ActivityType.MINTED) {
      return (
        <Th>
          <span className="material-symbols-outlined fill">auto_awesome</span>
          Minted
        </Th>
      );
    } else if (type === ActivityType.CANCEL) {
      return (
        <Th>
          <span className="material-symbols-outlined fill">cancel</span>
          Cancel
        </Th>
      );
    } else if (type === ActivityType.LIST) {
      return (
        <Th>
          <span className="material-symbols-outlined fill">sell</span>
          List
        </Th>
      );
    } else if (type === ActivityType.SELL) {
      return (
        <Th>
          <span className="material-symbols-outlined fill">shopping_cart</span>
          Sale
        </Th>
      );
    } else if (type === ActivityType.OFFER) {
      return (
        <Th>
          <Image src="/images/icon/approval_delegation.svg" />
          Offer
        </Th>
      );
    } else if (type === ActivityType.TRANSFER) {
      return (
        <Th>
          <span className="material-symbols-outlined fill">multiple_stop</span>
          Transfer
        </Th>
      );
    }
    return null;
  };

  const handlerOnOfferClick = () => {
    makeOfferModal.onOpen();
  };

  return (
    <React.Fragment>
      <Box borderRadius="lg" p={8} shadow="base">
        <VStack spacing={5}>
          {asset && (
            <div>
              <p>{asset.name}</p>
              <img src={asset.originalUrl} />
              <p>Desc: {asset.description}</p>
              <p>TokenID: {asset.tokenId}</p>
              <p>totalSupply: {asset.totalSupply}</p>
              <p>contract address: {asset.assetContractAddress}</p>
            </div>
          )}
          <HStack>
            <Button
              colorScheme="blue"
              bg="blue.400"
              color="white"
              _hover={{
                bg: "blue.500",
              }}
              onClick={handlerOnSellClick}
            >
              Sell
            </Button>
            <Button
              colorScheme="blue"
              bg="blue.400"
              color="white"
              _hover={{
                bg: "blue.500",
              }}
              onClick={handlerOnOfferClick}
            >
              Make offer
            </Button>
          </HStack>
          <Accordion defaultIndex={[0, 1]} allowMultiple>
            {/* Listings */}
            <AccordionItem className="listings" bg="popup_hover">
              <h2>
                <AccordionButton>
                  <Box as="span">
                    <span className="material-symbols-outlined fill">sell</span> Listings
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                {listings && listings.length ? (
                  <TableContainer>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Price</Th>
                          <Th>USD Price</Th>
                          <Th>Quantity</Th>
                          <Th>Expiration</Th>
                          <Th>From</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {listings.map((order: any) => {
                          const originalData = JSON.parse(order.originalData);
                          const { parameters: data } = originalData;
                          const amount = formatEther(
                            BigNumber.from(data.consideration[0].startAmount)
                          );
                          return (
                            <Tr key={order.id}>
                              <Td>{amount} BOA</Td>
                              <Td>$---.--</Td>
                              <Td>{`${order.amount - order.sold}`}</Td>
                              <Td>
                                {formatDistance(
                                  Number(data.endTime) * 1000,
                                  Number(data.startTime) * 1000,
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </Td>
                              <Td>
                                <span className="blue ellipsis">{shotAddress(account)}</span>
                              </Td>
                              <Td>
                                {order.status === OrderStatus.CANCELED ? (
                                  "Canceled"
                                ) : order.status === OrderStatus.SOLD ? (
                                  "Sold Out"
                                ) : order.status === OrderStatus.SALE &&
                                  account === data.offerer ? (
                                  <Button
                                    variant="primary"
                                    className="btn"
                                    onClick={() => {
                                      waitingModal.onOpen();
                                      setOrder(order);
                                      listingCancel(data);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                ) : (
                                  <Button
                                    variant="primary"
                                    className="btn"
                                    onClick={() => {
                                      console.log("ORIGIN_DATA:", originalData);
                                      waitingModal.onOpen();
                                      setOrder(order);
                                      listingFulfillHandler(originalData);
                                    }}
                                  >
                                    Fulfill
                                  </Button>
                                )}
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                    py="30px"
                  >
                    <Image src="/images/icon/empty-list.svg" />
                    <Text variant="txt167" mt="16px">
                      No Listings yet
                    </Text>
                  </Flex>
                )}
              </AccordionPanel>
            </AccordionItem>

            {/* Offers */}
            <AccordionItem className="offers" bg="popup_hover">
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <span className="material-symbols-outlined fill">toc</span> Offers
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel className="maxH" maxH={["315px", "315px", "315px", "727px"]}>
                {offers && offers.length ? (
                  <TableContainer>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Price</Th>
                          <Th>USD Price</Th>
                          <Th>Quantity</Th>
                          <Th>Floor Difference</Th>
                          <Th>Expiration</Th>
                          <Th>From</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {offers.map((order: any) => {
                          const originalData = JSON.parse(order.originalData);
                          const { parameters: data } = originalData;
                          return (
                            <Tr key={order.id}>
                              <Th>{formatEther(order.unitPrice)} WBOA</Th>
                              <Td>$---.--</Td>
                              <Td>{order.amount}</Td>
                              <Td>10% below{/* TODO : floor difference calc */}</Td>
                              <Td>
                                {formatDistance(Number(data.endTime) * 1000, Date.now(), {
                                  addSuffix: true,
                                })}
                              </Td>
                              <Td>
                                <span className="blue ellipsis">
                                  {order.offerer.userAddress === account
                                    ? "you"
                                    : shotAddress(order.offerer.userAddress)}
                                </span>
                              </Td>
                              <Td>
                                {order.status === OrderStatus.CANCELED ? (
                                  "Canceled"
                                ) : order.status === OrderStatus.SOLD ? (
                                  "Sold Out"
                                ) : order.status === OrderStatus.SALE &&
                                  account === data.offerer ? (
                                  <Button
                                    variant="primary"
                                    className="btn"
                                    onClick={() => {
                                      waitingModal.onOpen();
                                      setOrder(order);
                                      listingCancel(data);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      variant="primary"
                                      className="btn"
                                      onClick={() => {
                                        waitingModal.onOpen();
                                        setOrder(order);
                                        listingFulfillHandler(originalData);
                                      }}
                                    >
                                      Counter
                                    </Button>
                                    <Button
                                      variant="primary"
                                      className="btn"
                                      onClick={() => {
                                        waitingModal.onOpen();
                                        setOrder(order);
                                        console.log("ORIGIN_DATA:", originalData);
                                        offererFulfillHandler(originalData, order.amount);
                                      }}
                                    >
                                      Accept
                                    </Button>
                                  </>
                                )}
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                    py="30px"
                  >
                    <Image src="/images/icon/empty-offer.svg" />
                    <Text variant="txt167" mt="16px">
                      No offers yet
                    </Text>
                  </Flex>
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
          )
          <section className="item">
            <Accordion defaultIndex={[0]} allowMultiple>
              {/* Item Activity */}
              <AccordionItem bg="popup_hover">
                <h2>
                  <AccordionButton>
                    <Box as="span">
                      <span className="material-symbols-outlined">swap_vert</span> Item Activity
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel>
                  <TableContainer>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Event</Th>
                          <Th>Price</Th>
                          <Th>Quantity</Th>
                          <Th>From</Th>
                          <Th>To</Th>
                          <Th>Date</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {activities && activities.length ? (
                          activities.map((data: any, index: number) => {
                            const amount = data?.order?.unitPrice
                              ? formatEther(data.order.unitPrice)
                              : null;
                            return (
                              <Tr key={index}>
                                {getEventType(data.activityType)}
                                <Td>
                                  {amount
                                    ? `${amount} ${
                                        data?.order?.offerType === "OFFERING" ? "WBOA" : "BOA"
                                      }`
                                    : null}{" "}
                                </Td>
                                <Td>{data.amount}</Td>
                                <Td>
                                  <span className="blue ellipsis">
                                    {data?.from && shotAddress(data.from.userAddress)}
                                  </span>
                                </Td>
                                <Td>
                                  <span className="blue ellipsis">
                                    {data?.to && shotAddress(data.to.userAddress)}
                                  </span>{" "}
                                  <Tooltip label="Supply Tooltip" placement="right">
                                    <InfoIcon ml="5px" color="Point_Red" fontSize="16px" />
                                  </Tooltip>
                                </Td>
                                <Td>
                                  {formatDistance(new Date(data.createdAt), new Date(), {
                                    addSuffix: true,
                                  })}
                                </Td>
                              </Tr>
                            );
                          })
                        ) : (
                          <Tr>
                            <Td colSpan={100}>
                              <Flex
                                alignItems="center"
                                justifyContent="center"
                                flexDirection="column"
                                py="80px"
                                textAlign="center"
                              >
                                <Image src="/images/icon/empty_item.svg" />
                                <Text variant="txt167" mt="16px" mr="-15px">
                                  No item activity yet
                                </Text>
                              </Flex>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </section>
        </VStack>
      </Box>
      <WaitingModal isOpen={waitingModal.isOpen} onClose={waitingModal.onClose} />
      <MakeOffer isOpen={makeOfferModal.isOpen} onClose={makeOfferModal.onClose} asset={asset} />
    </React.Fragment>
  );
}
