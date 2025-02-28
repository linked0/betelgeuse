import React, { useMemo, useState } from "react";
import styled from "styled-components";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  Show,
  SimpleGrid,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import IconCopy from "../../components/icon/Copy";
import VerifiedIcon from "../../components/icon/Verified";
import FiltersButton from "../../components/collection/FiltersButton";
import SortButton from "../../components/collection/SortButton";
import FiltersEl from "../../components/collection/FilterEl";
import MenuSns from "../../components/My/Menu";
import GridAlign, { ViewMode } from "../../components/My/GrideAlign";
import CollectionAssetCardView from "../../components/assets/CollectionAssetCardView";
import { useParams } from "react-router-dom";
import { useGetAssetCollectionByNameQuery } from "../../hooks/query/useGetAssetCollectionByNameQuery";
import { numberFormat } from "../../utils/Format";
import { shotAddress } from "../../utils/WalletUtils";
import { CollectionStatistics } from "../../components/collection/CollectionStatistics";
import { CollectionAssetListView } from "../../components/collection/CollectionAssetListView";
import { SortingMenu } from "../../components/Filter/SortingMenu";

export default function ListCollectionPub() {
  const { name } = useParams();
  const [isShortInfo, setShortInfo] = useState<boolean>(true);
  const collectionData = useGetAssetCollectionByNameQuery(name);
  const [flag, setFlag] = useBoolean(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const { collection, assets, creator, profile, totalFee, totalItems, totalOwners } =
    useMemo(() => {
      if (collectionData?.GetAssetCollectionByName) {
        const data = collectionData.GetAssetCollectionByName;
        return {
          collection: data,
          assets: data?.assets,
          creator: data.creator,
          profile: data.creator?.profile,
          totalFee: data?.feeCollectors.reduce((sum: number, set: any) => sum + set.fee, 0),
          totalItems: data?.assets?.reduce((sum: number, asset: any) => sum + asset.totalSupply, 0),
          totalOwners: data?.assets?.reduce(
            (sum: number, asset: any) => sum + asset.owners.length,
            0
          ),
        };
      }
      return {};
    }, [collectionData]);

  return (
    <>
      <Box mx="-25px" overflow="hidden">
        <Box pos="relative" maxH="320px">
          <Box pt="25%">
            <Box
              boxSizing="border-box"
              display="block"
              overflow="hidden"
              width="initial"
              height="initial"
              background="none"
              opacity="1"
              border="0px"
              margin="0px"
              padding="0px"
              position="absolute"
              inset="0px"
            >
              <Image
                src={collection?.bannerUrl ? collection?.bannerUrl : "/images/bg/main_1920_top.jpg"}
                position="absolute"
                inset="0px"
                box-sizing="border-box"
                padding="0px"
                border="none"
                margin="auto"
                display="block"
                width="0px"
                height="0px"
                minWidth="100%"
                maxWidth="100%"
                minHeight="100%"
                maxHeight="100%"
                objectFit="cover"
              />
            </Box>
          </Box>
        </Box>
        <Container>
          <Flex pt={[0, 0, 0, "34px", "25px"]}>
            <Button
              pos="relative"
              overflow="hidden"
              w={["88px", "88px", "88px", "124px", "180px"]}
              h={["88px", "88px", "88px", "124px", "180px"]}
              mt={["-40px", "-40px", "-40px", "-128px", "-185px"]}
              p="0"
              bg="black"
              borderWidth="4px"
              borderColor="#141225"
              borderRadius="15px"
            >
              <Image src={collection?.logoUrl} objectFit="cover" objectPosition="50% 50%" />
            </Button>
          </Flex>
        </Container>
      </Box>
      <Box pos="relative" maxW="100%" pt={["28px", "28px", "28px", "15px"]}>
        <HStack
          pos="absolute"
          top={["-40px", "-40px", "-40px", "10px"]}
          right="-4px"
          align="center"
          spacing="12px"
        >
          <MenuSns data={collection} />
          {/*<Divider orientation="vertical" borderColor="text_Gray01" h="20px" mt="2px !important" />
          <ChainColl />*/}
        </HStack>
        <HStack spacing="10px" align="center">
          <HStack maxW="60%">
            <Heading
              as="h2"
              variant="subtit30"
              overflow="hidden"
              mb="0"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
            >
              {collection?.name}
            </Heading>
            <VerifiedIcon />
          </HStack>
          <HStack py="3px" px="10px" borderWidth="2px" borderColor="#443F5B" borderRadius="24px">
            <Text fontSize="9px" fontWeight="400">
              {creator?.userAddress && shotAddress(creator.userAddress)}
            </Text>
            <IconCopy address={creator?.userAddress} />
          </HStack>
        </HStack>
        {profile && (
          <HStack mt="10px">
            <Text variant="txt164" color="White">
              By
            </Text>
            <Text variant="txt166">{profile?.name}</Text>
            <Box as="span" ml="3px !important" color="#A796FF">
              <span className="material-symbols-outlined fill" style={{ fontSize: "16px" }}>
                verified
              </span>
            </Box>
          </HStack>
        )}

        <LessThan className={isShortInfo && "short"} mt="12px">
          <Text variant="txt172" className="txt" color="White">
            {collection?.description
              ? collection.description
              : `Welcome to the home of ${collection?.name} on BOASPACE.  
               Discover the best items in this collection.`}
          </Text>
          {isShortInfo && (
            <Button
              h="34px"
              color="Secondary_V"
              fontSize="17px"
              onClick={() => {
                setShortInfo(false);
              }}
            >
              See more <ChevronDownIcon ml="5px" fontSize="24px" />
            </Button>
          )}
        </LessThan>
      </Box>

      <CollectionStatistics royalty={totalFee} items={totalItems} owners={totalOwners} />

      <Tabs mt={["32px", "32px", "32px", "40px", "40px"]}>
        <TabList>
          <Tab>Items</Tab>
        </TabList>

        <TabPanels>
          <TabPanel pt="30px">
            {/* https://opensea.io/collection/doodles-official
                위 사이트와 같이 FilterWrap이 header의 bottom 에 붙을 경우
                className="fixed" 추가
            */}
            <FilterWrap className="">
              <SimpleGrid columns={2} spacing="10px">
                <FiltersButton onClick={setFlag.toggle} />
                <Show breakpoint="(max-width: 1023px)">
                  <SortButton />
                </Show>
              </SimpleGrid>
              <HStack spacing="10px">
                <Show breakpoint="(min-width: 1024px)">
                  <SortingMenu />
                </Show>
                <Show breakpoint="(min-width: 1024px)">
                  <GridAlign mode={viewMode} onChange={(m) => setViewMode(m)} />
                </Show>
                <Button
                  variant="gray"
                  w={["100%", "100%", "100%", "100%", "220px"]}
                  mt={["10px", "10px", "10px", "10px", "0"]}
                >
                  Make collection offer
                </Button>
              </HStack>
            </FilterWrap>
            <HStack align="flex-start" justify="space-between" w="100%" mt="30px" spacing="0">
              <Show breakpoint="(min-width: 1023px)">
                {flag && (
                  <Box display="block" w="300px" mt="-15px" ml="-15px" mr="38px">
                    <FiltersEl />
                  </Box>
                )}
              </Show>
              <Box
                maxW="100%"
                flexGrow="1"
                // w={["100%", "100%", "100%", "100%", "calc(100% - 325px)"]}
              >
                <Flex px="0">
                  <HStack>
                    <span className="material-symbols-outlined">autorenew</span>
                    <Text variant="txt174" color="#706D82">
                      Updated 4s ago
                    </Text>
                  </HStack>
                  <Spacer />
                  <Text variant="txt174">
                    {assets &&
                      assets?.length &&
                      `${numberFormat.format(assets.length)}
                      ${assets.length < 2 ? "item" : "items"}`}
                  </Text>
                </Flex>
                {viewMode === ViewMode.GRID ? (
                  <CollectionAssetCardView assets={assets} isTransaction={true} />
                ) : (
                  <CollectionAssetListView assets={assets} />
                )}
              </Box>
            </HStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

const FilterWrap = styled(Box)`
  &.fixed {
    position: fixed;
    top: 72px;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 0 25px;
    background-color: rgba(21, 18, 37, 0.7);
    backdrop-filter: blur(10px);
  }
  @media screen and (min-width: 1024px) {
    display: flex;
    justify-content: space-between;
  }
`;

const LessThan = styled(Box)`
  max-width: 60%;
  .txt {
    white-space: pre-line;
  }
  &.short {
    .txt {
      overflow: hidden;
      height: 25px;
      text-overflow: ellipsis;
    }
  }
`;
