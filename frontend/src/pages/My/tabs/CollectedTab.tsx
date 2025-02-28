import React, { useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { useGetUserAssetsQuery } from "../../../hooks/query/useGetUserAssetsQuery";
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Show,
  SimpleGrid,
  Spacer,
  TabPanel,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import FiltersButton from "../../../components/collection/FiltersButton";
import SortButton from "../../../components/collection/SortButton";
import GridAlign, { ViewMode } from "../../../components/My/GrideAlign";
import FiltersEl from "../../../components/collection/FilterEl";
import { numberFormat } from "../../../utils/Format";
import CollectionAssetCardView from "../../../components/assets/CollectionAssetCardView";
import styled from "styled-components";
import { useCollectedList } from "../../../features/asset/assetsSlice";
import { formatDistanceToNowStrict } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { MyTabProps } from "../index";
import { CollectionAssetListView } from "../../../components/collection/CollectionAssetListView";
import { SortingMenu, SortType } from "../../../components/Filter/SortingMenu";

export default function CollectedTab({ currentTime }: MyTabProps) {
  const navigate = useNavigate();
  const { account } = useEthers();
  const { refetch } = useGetUserAssetsQuery(account) || null;
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const assetList = useCollectedList();
  const [distanceTime, setDistanceTime] = useState("");
  const updateTime = useSelector((state: RootState) => state.assets.updateTime);
  const [filter, setFilter] = useState(SortType[0]);
  const [flag, setFlag] = useBoolean(true);

  useEffect(() => {
    if (updateTime) setDistanceTime(`Updated ${formatDistanceToNowStrict(updateTime)}`);
  }, [currentTime, updateTime]);

  const handlerChangeFilter = (type: number) => {
    setFilter(SortType[type]);
  };

  return (
    <TabPanel>
      {/* https://opensea.io/collection/doodles-official
                위 사이트와 같이 FilterWrap이 header의 bottom 에 붙을 경우
                className="fixed" 추가
            */}
      <FilterWrap className="" styled={{ position: "relative" }}>
        <SimpleGrid columns={2} spacing="10px" mt={[0, 0, 0, "10px"]}>
          <Box
            bg={["popup_B01", "popup_B01", "popup_B01", "popup_B01", "transparent"]}
            borderRadius="8px"
          >
            <FiltersButton onClick={setFlag.toggle} />
          </Box>
          <Show breakpoint="(max-width: 1023px)">
            <SortButton />
          </Show>
        </SimpleGrid>
        <HStack spacing="10px">
          <Show breakpoint="(min-width: 1024px)">
            <SortingMenu onChange={handlerChangeFilter} filter={filter} />
          </Show>
          <Show breakpoint="(min-width: 1024px)">
            <GridAlign mode={viewMode} onChange={(m) => setViewMode(m)} />
          </Show>
        </HStack>

        <Button
          variant="primary"
          w={["100%", "100%", "100%", "100%", "130px"]}
          onClick={() => navigate("/importNFT")}
          mt="10px"
          borderRadius="10px"
          pos={["static", "static", "static", "static", "absolute"]}
          right="0"
          top="-30px"
        >
          Import
        </Button>
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
              {distanceTime !== "" && (
                <React.Fragment>
                  <IconButton
                    style={{ padding: 0, margin: 0, minWidth: 22, minHeight: 22, height: "22px" }}
                    icon={<span className="material-symbols-outlined">autorenew</span>}
                    aria-label="reload"
                    onClick={() => refetch({ userAddress: account })}
                  />
                  <Text variant="txt174" color="#706D82">
                    {distanceTime}
                  </Text>
                </React.Fragment>
              )}
            </HStack>
            <Spacer />
            {assetList?.length && (
              <Text variant="txt176" color="White">
                {`${assetList?.length && numberFormat.format(assetList.length)}
                ${assetList.length < 2 ? "item" : "items"}`}
              </Text>
            )}
          </Flex>
          {viewMode === ViewMode.GRID ? (
            <CollectionAssetCardView assets={assetList} isTransaction={false} />
          ) : (
            <CollectionAssetListView assets={assetList} />
          )}
        </Box>
      </HStack>

      {/*<CollectedList />*/}
    </TabPanel>
  );
}

export const FilterWrap = styled(Box)`
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
