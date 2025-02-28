import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  HStack,
  Image,
  Show,
  SimpleGrid,
  Spacer,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import LinkShare from "../../components/Link/share";
import SnsList from "../../components/snsList";
import ViewHeart from "../../components/assets/viewHeart";
import TooltipVerified from "../../components/TooltipVerified";
import ThumbRatio from "../../components/ThumbRatio";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEthers } from "@usedapp/core";
import { useGetAssetDetailQuery } from "../../hooks/query/useGetAssetDetailQuery";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { format, formatDistance } from "date-fns";
import { shotAddress } from "../../utils/WalletUtils";
import { ActivityType, OrderStatus } from "../../type";
import { FavoriteList } from "../../components/Modals/FavoriteList";
import { MakeOffer } from "../../components/Modals/MakeOffer";
import { ApprovePurchase } from "../../components/Modals/ApprovePurchase";
import { CancelOrder } from "../../components/Modals/CancelOrder";
import { UnreviewedCollection } from "../../components/Modals/UnreviewedCollection";
import ActivityList from "./component/ActivityList";
import MoreCollectionList from "./component/MoreCollection";
import { PurchaseComplete } from "../../components/Modals/PurchaseComplete";
import { FundsPurchase } from "../../components/Modals/FundsPurchase";
import OwnerButtons from "./component/OwnerButtons";
import { AcceptOffer } from "../../components/Modals/AcceptOffer";
import PropertiesItem from "../../components/assets/PropertiesItem";
import LevelsItem from "../../components/assets/LevelsItem";
import StatsItem from "../../components/assets/StatsItem";
import { FavoriteIcon } from "../../components/Button/Favorite";
import { getUSDPrice, useBOAPrice } from "../../features/price/boaPriceSlice";
import { useDispatch } from "react-redux";
import { addCart } from "../../features/cart/cartSlice";

export default function AssetDetailPub() {
  // modal
  const favoriteModal = useDisclosure();
  const addFundsModal = useDisclosure();
  const makeOfferModal = useDisclosure();
  const unreviewedModal = useDisclosure();
  const completeModal = useDisclosure();
  const approvePurchaseModal = useDisclosure();
  const cancelModal = useDisclosure();
  const offerFulFillModal = useDisclosure();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { account } = useEthers();
  const toast = useToast({
    position: "bottom-right",
    variant: "variant",
  });

  const { contract, tokenId } = useParams();
  // const cart = useSelector((state: RootState) => state.cart);
  const usd = useBOAPrice();
  const assetDetailData = useGetAssetDetailQuery(contract, tokenId);
  const [currentOrderData, setCurrentOrderData] = useState(undefined);
  const [recommendedDeal, setRecommendedDeal] = useState(undefined);
  const [recommendedDealOriginalData, setRecommendedDealOriginalData] = useState(undefined);
  const [cancelOrderData, setCancelOrderData] = useState(undefined);
  // const [availableQuantity, setAvailableQuantity] = useState(0);

  const {
    asset,
    activities,
    listings,
    offers,
    owners,
    assetContract,
    assetCollection,
    sortListings,
    attribute,
  } = useMemo(() => {
    console.log("assetDetail", assetDetailData);
    if (assetDetailData && assetDetailData?.GetAssetDetail) {
      const listings = assetDetailData.GetAssetDetail.activities
        .filter(
          (active: any) =>
            active.activityType === "LIST" &&
            active.order.status !== "CANCELED" &&
            active.order.status !== "SOLD"
        )
        .map((active: any) => active.order);
      return {
        asset: assetDetailData.GetAssetDetail,
        activities: [...assetDetailData.GetAssetDetail.activities].reverse(),
        assetCollection: assetDetailData.GetAssetDetail.assetCollection,
        assetContract: assetDetailData.GetAssetDetail.assetContract,
        listings,
        sortListings: listings.sort((a: any, b: any) => a.unitPrice - b.unitPrice),
        offers: assetDetailData.GetAssetDetail.activities
          .filter(
            (active: any) =>
              active.activityType === "OFFER" &&
              active.order.status !== "CANCELED" &&
              active.order.status !== "ACCEPTED"
          )
          .map((active: any) => active.order),
        owners: assetDetailData.GetAssetDetail.owners,
        attribute: assetDetailData?.GetAssetDetail?.attribute
          ? JSON.parse(assetDetailData.GetAssetDetail.attribute)
          : undefined,
      };
    }
    return {};
  }, [assetDetailData]);

  useEffect(() => {
    if (sortListings?.length > 0) {
      const order = sortListings[0];
      console.log("RecommendedDeal ", order);
      setRecommendedDeal(order);
      console.log("RecommendedDeal ", JSON.parse(order.originalData));
      setRecommendedDealOriginalData(JSON.parse(order.originalData));
    } else {
      setRecommendedDeal(undefined);
    }
  }, [sortListings, setRecommendedDeal]);

  const { isOwner, yourItemCount, assetCount, ownerAddress } = useMemo(() => {
    if (owners && account) {
      const owner = owners.find((o: any) => o.amount > 0 && o?.user?.userAddress === account);
      const item: number = owner?.amount ?? NaN;
      const ownerAddress = owners?.map((o: any) => o.amount > 0 && o?.user?.userAddress);
      const assetCount = owners?.map((o: any) => {
        if (o.amount > 0 && o?.user?.userAddress === account) {
          return o.amount;
        }
        return 0;
      });
      return {
        isOwner: owner ? true : false,
        yourItemCount: item,
        assetCount,
        ownerAddress,
        ownerCount: owners?.length,
      };
    }
    return { isOwner: false };
  }, [owners, account]);

  const handlerOnSellClick = useCallback(() => {
    navigate(location.pathname + "/sell");
  }, [navigate, location]);

  const handlerOnEditClick = useCallback(() => {
    navigate(location.pathname + "/edit");
  }, [navigate, location]);

  return (
    <DetailWrap className="sell-edit">
      <AssetsDetailWrap>
        <section className="my">
          <Flex alignItems="center" color="Secondary_V">
            <Text variant="txt154">{assetCollection?.name}</Text>
            <span
              className="material-symbols-outlined fill"
              style={{
                color: "Secondary_V",
                margin: "0 0 0 5px",
                fontWeight: "700",
                fontSize: "18px",
              }}
            >
              verified
            </span>
          </Flex>
          <Heading variant="subtit30" mt="25px" mb="14px">
            {asset?.name}
          </Heading>
          <Text variant="txt154">
            {isOwner ? assetCount : ""} Owned by{" "}
            <span style={{ color: "#A796FF" }}>
              {isOwner
                ? "you"
                : ownerAddress?.length
                ? shotAddress(ownerAddress[0])
                : shotAddress(asset?.creator?.userAddress)}
            </span>
          </Text>
          <LinkShare />
          <Show above="lg">
            <Box mt="37px" pb="11px">
              <ViewHeart
                ownerCount={owners?.length ?? NaN}
                viewCount={asset?.viewCount}
                itemCount={yourItemCount}
              />
            </Box>
          </Show>
        </section>
        <section className="image">
          <Stack
            overflow="hidden"
            maxWidth="100%"
            borderRadius="8px"
            background="popup_BBGG"
            borderColor="popup_B01"
            borderWidth="1px"
          >
            <Stack
              direction="row"
              justify="flex-end"
              align="center"
              spacing="0px"
              w="100%"
              h="45px"
              px="16px"
              bg="popup_BBG"
              borderBottom="1px solid;"
              borderColor="popup_B01"
            >
              <Text variant="txt136" color="text_Gray02" mr="10px">
                {asset?.favoriteCount}
              </Text>
              <FavoriteIcon assetData={asset} />
            </Stack>
            <ThumbRatio src={asset?.originalUrl} />
          </Stack>
          <Show breakpoint="(max-width: 1023px)">
            <ViewHeart ownerCount={owners?.length ?? NaN} viewCount={asset?.viewCount} />
          </Show>
        </section>
        <section className="info">
          <Stack
            borderRadius="8px"
            background="popup_hover"
            borderColor="popup_B01"
            borderWidth="1px"
          >
            <HStack
              px="17px"
              py="23px"
              alignItems="flex-start"
              borderColor="popup_B01"
              borderBottomWidth="1px"
            >
              {recommendedDealOriginalData && (
                <>
                  <Image src="/images/icon/alarm.svg" />
                  <Text color="#C4C4D3" variant="txt164">
                    {`${format(
                      new Date(recommendedDealOriginalData?.parameters?.endTime * 1000),
                      "'Sale ends 'yyyy/M/d 'at 'aaaa h:mm 'GMT'XXX"
                    )}`}
                  </Text>
                </>
              )}
            </HStack>
            <Stack px="20px" pt="7px" pb="20px">
              {recommendedDeal && (
                <>
                  <Text variant="txt164" color="text_Gray01">
                    Current price
                  </Text>
                  <HStack>
                    <Text variant="txt306">{formatEther(recommendedDeal.unitPrice)} BOA</Text>
                    <Text variant="txt164" color="text_Gray01" marginTop="9px !important">
                      {recommendedDeal?.unitPrice && usd
                        ? getUSDPrice(recommendedDeal.unitPrice, usd)
                        : "$--.--"}
                    </Text>
                  </HStack>
                </>
              )}
              <Stack
                direction={["column", "column", "column", "column", "row"]}
                pt="7px"
                spacing={["20px", "20px", "20px", "15px"]}
              >
                <HStack w={["100%", "100%", "100%", "100%", "48%"]}>
                  {!isOwner && recommendedDeal && (
                    <React.Fragment>
                      <Button
                        variant="primary"
                        borderRightRadius="0"
                        borderLeftRadius="8px"
                        w="100%"
                        h="62px"
                        borderRightWidth="1px"
                        borderColor="#2C273F"
                        onClick={() => {
                          dispatch(addCart({ asset, orderData: recommendedDeal }));
                          toast({
                            title: "Successfully add cart",
                            status: "success",
                          });
                        }}
                        leftIcon={
                          <span className="material-symbols-outlined fill">shopping_cart</span>
                        }
                        /*  rightIcon={<AddIcon boxSize={4} />}*/
                      >
                        Add
                      </Button>
                      <Button
                        variant="primary"
                        w="100%"
                        h="62px"
                        borderRightRadius="8px"
                        borderLeftRadius="0"
                        m="0 !important"
                        borderLeftWidth="1px"
                        borderColor="#BCBCCB"
                        onClick={() => {
                          setCurrentOrderData(recommendedDeal);
                          approvePurchaseModal.onOpen();
                        }}
                        leftIcon={<span className="material-symbols-outlined fill">bolt</span>}
                      >
                        Buy now
                      </Button>
                    </React.Fragment>
                  )}
                </HStack>
                <Button
                  variant="gray3"
                  w={["100%", "100%", "100%", "100%", "51%"]}
                  h="62px"
                  onClick={makeOfferModal.onOpen}
                  leftIcon={<span className="material-symbols-outlined fill">sell</span>}
                >
                  Maker offer
                </Button>
              </Stack>
            </Stack>
          </Stack>

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
                          const amount = formatEther(BigNumber.from(order.unitPrice));
                          return (
                            <Tr key={order.id}>
                              <Td>{amount} BOA</Td>
                              <Td>{getUSDPrice(order.unitPrice, usd)}</Td>
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
                                      cancelModal.onOpen();
                                      setCancelOrderData(order);
                                      // listingCancel(data);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                ) : (
                                  <Button
                                    variant="primary"
                                    className="btn"
                                    onClick={() => {
                                      dispatch(addCart({ asset, orderData: order }));
                                      toast({
                                        title: "Successfully add cart",
                                        status: "success",
                                      });
                                    }}
                                    leftIcon={
                                      <span className="material-symbols-outlined fill">
                                        shopping_cart
                                      </span>
                                    }
                                  >
                                    +
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
                              <Td>{getUSDPrice(order.unitPrice, usd)}</Td>
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
                                      setCancelOrderData(order);
                                      cancelModal.onOpen();
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                ) : (
                                  <>
                                    {/*<Button
                                      variant="primary"
                                      className="btn"
                                      onClick={() => {
                                        setCurrentOrderData(order);
                                      }}
                                    >
                                      Counter
                                    </Button>*/}
                                    <Button
                                      variant="primary"
                                      minW="75px"
                                      h="37px"
                                      borderRadius="6px"
                                      className="btn"
                                      onClick={() => {
                                        setCurrentOrderData(order);
                                        offerFulFillModal.onOpen();
                                        // console.log("ORIGIN_DATA:", originalData);
                                        // offererFulfillHandler(originalData, order.amount);
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
        </section>
        <section className="description">
          <Heading
            variant="sectit700"
            p="20px 17px"
            mt="0"
            borderBottomWidth="1"
            borderColor="#3D3755"
          >
            <span className="material-symbols-outlined">format_align_left</span> Description
          </Heading>

          <Box
            pl="30px"
            pr="17px"
            pt={["27px", "27px", "27px", "25px"]}
            pb={["28px", "28px", "28px", "30px"]}
          >
            <HStack>
              <Text variant="txt166">
                {"By "}
                {isOwner
                  ? "you"
                  : ownerAddress?.length
                  ? shotAddress(ownerAddress[0])
                  : shotAddress(asset?.creator?.userAddress)}
              </Text>
              <TooltipVerified />
            </HStack>
            <Text variant="txt134">{assetCollection?.name}</Text>
          </Box>

          <Accordion variant="line" allowMultiple>
            {/* Properties */}
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <span className="material-symbols-outlined fill">label</span> Properties
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel px="20px" py="10px">
                <SimpleGrid columns={[1, 1, 1, 2, 2, 3]} spacing="9px">
                  {attribute?.properties?.map((item: any, index: number) => {
                    return <PropertiesItem property={item} key={index} />;
                  })}
                </SimpleGrid>
              </AccordionPanel>
            </AccordionItem>

            {/* Levels */}
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <span className="material-symbols-outlined fill">grade</span> Levels
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel px="20px">
                <Stack spacing="10px">
                  {attribute?.levels?.map((item: any, index: number) => {
                    return <LevelsItem item={item} key={index} borderVisible={false} />;
                  })}
                </Stack>
              </AccordionPanel>
            </AccordionItem>

            {/* Stats */}
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <span className="material-symbols-outlined">equalizer</span> Stats
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel px="20px">
                <Stack spacing="10px">
                  {attribute?.stats?.map((item: any, index: number) => {
                    return <StatsItem item={item} key={index} borderVisible={false} />;
                  })}
                </Stack>
              </AccordionPanel>
            </AccordionItem>

            {/* Details */}
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <span className="material-symbols-outlined fill">display_settings</span> Details
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel px="20px" py="20px">
                <Stack spacing="7px" color="text_Gray02">
                  <Flex>
                    <Text variant="txt165">Contract Address</Text>
                    <Spacer />
                    <Text variant="txt165" color="#A796FF">
                      {asset?.assetContractAddress && shotAddress(asset.assetContractAddress)}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text variant="txt165">Token ID</Text>
                    <Spacer />
                    <Text variant="txt165" color="#A796FF">
                      {asset?.tokenId && shotAddress(asset.tokenId)}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text variant="txt165">Token Standard</Text>
                    <Spacer />
                    <Text variant="txt165">{assetContract?.itemType}</Text>
                  </Flex>
                  <Flex>
                    <Text variant="txt165">Chain</Text>
                    <Spacer />
                    <Text variant="txt165">BOSagora</Text>
                  </Flex>
                  {assetContract?.metaType === "CENTRALIZED" && (
                    <Flex>
                      <Text variant="txt165">Metadata</Text>
                      <Spacer />
                      <Text variant="txt165">Centralized</Text>
                    </Flex>
                  )}
                  <Flex>
                    <Text variant="txt165">Last Updated</Text>
                    <Spacer />
                    <Text variant="txt165">
                      {asset?.updatedAt &&
                        formatDistance(new Date(asset.updatedAt), Date.now(), {
                          addSuffix: true,
                        })}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text variant="txt165">Creator Fee {/*<TooltipBtn />*/}</Text>
                    <Spacer />
                    <Text variant="txt165">2.5%</Text>
                  </Flex>
                </Stack>
              </AccordionPanel>
            </AccordionItem>

            {/* About NFT */}
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <span className="material-symbols-outlined fill">vertical_split</span>
                    {` About ${assetCollection?.name}`}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel px="20px">
                <Checkbox>
                  <Text variant="txt154" color="text_Gray02">
                    Meta Island represent a collection of 3’434 unique islands categorized by level
                    of rarity and generated with hundreds of elements. Category{" "}
                    <Text as="span" variant="txt157">
                      Art
                    </Text>
                  </Text>
                </Checkbox>
                <SnsList />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </section>

        <section className="item">
          <ActivityList activities={activities} />
        </section>

        <section className="more">
          <MoreCollectionList collection={assetCollection} currentAssetId={asset?.id} />
        </section>
      </AssetsDetailWrap>

      {/* Sell & Edit */}
      <OwnerButtons
        isSell={isOwner}
        isEdit={
          assetContract?.metaType === "CENTRALIZED" &&
          activities?.length === 1 &&
          activities[0].activityType === ActivityType.MINTED
        }
        onSellClick={handlerOnSellClick}
        onEditClick={handlerOnEditClick}
      />

      {/* unreviewed collection */}
      <UnreviewedCollection isOpen={unreviewedModal.isOpen} onClose={unreviewedModal.onClose} />
      {/* Favorited By */}
      <FavoriteList isOpen={favoriteModal.isOpen} onClose={favoriteModal.onClose} />

      {/* Add funds to purchase */}
      <FundsPurchase isOpen={addFundsModal.isOpen} onClose={addFundsModal.onClose} />

      {cancelModal?.isOpen && (
        <CancelOrder
          isOpen={cancelModal.isOpen}
          onClose={cancelModal.onClose}
          asset={asset}
          orderData={cancelOrderData}
          setOrderData={setCancelOrderData}
        />
      )}

      {makeOfferModal?.isOpen && (
        <MakeOffer isOpen={makeOfferModal.isOpen} onClose={makeOfferModal.onClose} asset={asset} />
      )}

      <ApprovePurchase
        isOpen={approvePurchaseModal.isOpen}
        onClose={approvePurchaseModal.onClose}
        asset={asset}
        orderData={currentOrderData}
        complete={() => completeModal.onOpen()}
      />
      {/* completeModal */}
      <PurchaseComplete
        isOpen={completeModal.isOpen}
        onClose={completeModal.onClose}
        asset={asset}
      />

      {/* Accept offer Modal*/}
      <AcceptOffer
        isOpen={offerFulFillModal.isOpen}
        onClose={offerFulFillModal.onClose}
        asset={asset}
        orderData={currentOrderData}
      />
    </DetailWrap>
  );
}

const DetailWrap = styled.div`
  padding-top: 0;
  &.sell-edit {
    .btn-float {
      display: flex;
    }
  }
  @media all and (min-width: 1024px) {
    &.sell-edit {
      padding-top: 86px;
    }
  }
`;

const AssetsDetailWrap = styled.div`
  section {
    position: relative;
    width: 100%;
    margin-top: 8px;
    &.my {
      margin-top: 19px;
    }
    &.image {
      margin-top: 15px;
    }
    &.info {
      margin-top: 30px;
      > div {
        width: 100%;
      }
    }
    &.description {
      border-radius: 8px;
      border: 1px solid #443f5b;
      background: #2c273f;
    }
    .listings {
      margin-top: 8px;
    }
    .offers {
      margin-top: 8px;
    }
  }
  @media all and (min-width: 1024px) {
    display: grid;
    gap: 18px;
    grid-template-columns: 43.5% 55%;
    grid-template-rows: 190px 258px auto;
    margin-top: 20px;
    section {
      &.my {
        grid-column: 2;
        grid-row: 1;
        margin-top: 10px;
      }
      &.image {
        grid-column: 1;
        grid-row: 1 / span 3;
        margin-top: 0;
      }
      &.info {
        gap: 18px;
        grid-column: 2;
        grid-row: 2 / span 4;
        margin-top: 4px;
      }
      &.description {
        grid-column: 1;
        grid-row: 4;
        margin-top: 0;
      }
      &.item {
        grid-column: 1 / span 2;
        grid-row: 5;
        margin-top: 0;
      }
      &.more {
        grid-column: 1 / span 2;
        grid-row: 6;
        margin-top: 0;
      }
      .listings {
        margin-top: 18px;
      }
      .offers {
        margin-top: 18px;
      }
    }
  }
`;
