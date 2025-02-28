import { useFavoriteList, useFavoriteUpdateTime } from "../../../features/favorite/favoriteSlice";
import React, { useEffect, useState } from "react";
import { Box, Flex, HStack, Show, Spacer, TabPanel, Text } from "@chakra-ui/react";
import { numberFormat } from "../../../utils/Format";
import CollectionAssetCardView from "../../../components/assets/CollectionAssetCardView";
import { FilterWrap } from "./CollectedTab";
import { formatDistanceToNowStrict } from "date-fns";
import { MyTabProps } from "../index";
import { SortingMenu, SortType } from "../../../components/Filter/SortingMenu";

export default function FavoritesTab({ currentTime }: MyTabProps) {
  const assetList = useFavoriteList();
  const [assets, setAssets] = useState([]);
  const [distanceTime, setDistanceTime] = useState("");
  const updateTime = useFavoriteUpdateTime();
  const [filter, setFilter] = useState(SortType[0]);

  useEffect(() => {
    if (updateTime) setDistanceTime(`Updated ${formatDistanceToNowStrict(updateTime)}`);
  }, [currentTime, updateTime]);

  useEffect(() => {
    setAssets(assetList);
  }, [assetList]);

  const handlerChangeFilter = (type: number) => {
    setFilter(SortType[type]);
  };

  return (
    <TabPanel>
      <FilterWrap>
        <HStack spacing="10px" width="100%" justifyContent="flex-end">
          <Show breakpoint="(min-width: 1024px)">
            <Box w="240px" pos="relative">
              <SortingMenu onChange={handlerChangeFilter} filter={filter} />
            </Box>
          </Show>
        </HStack>
      </FilterWrap>
      <HStack align="flex-start" justify="space-between" w="100%" mt="30px" spacing="0">
        <Box maxW="100%" flexGrow="1">
          <Flex px="10px">
            <HStack>
              {/*TODO : Favorites reload*/}
              {/*<span className="material-symbols-outlined">autorenew</span>*/}
              <Text variant="txt174" color="#706D82">
                {distanceTime}
              </Text>
            </HStack>
            <Spacer />
            <Text variant="txt176">{`${assets?.length && numberFormat.format(assets.length)}
                ${assets?.length < 2 ? "item" : "items"}`}</Text>
          </Flex>

          {/* grid */}
          <CollectionAssetCardView assets={assets} />
        </Box>
      </HStack>
    </TabPanel>
  );
}
