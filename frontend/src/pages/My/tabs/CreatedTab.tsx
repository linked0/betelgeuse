import { useNavigate } from "react-router-dom";
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
import FiltersButton from "../../../components/collection/FiltersButton";
import SortButton from "../../../components/collection/SortButton";
import GridAlign, { ViewMode } from "../../../components/My/GrideAlign";
import FiltersEl from "../../../components/collection/FilterEl";
import { numberFormat } from "../../../utils/Format";
import CollectionAssetCardView from "../../../components/assets/CollectionAssetCardView";
import { FilterWrap } from "./CollectedTab";
import { useCreatedList } from "../../../features/asset/assetsSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { formatDistanceToNowStrict } from "date-fns";
import { MyTabProps } from "../index";
import { CollectionAssetListView } from "../../../components/collection/CollectionAssetListView";
import { SortingMenu } from "../../../components/Filter/SortingMenu";

export default function CreatedTab({ currentTime }: MyTabProps) {
  const navigate = useNavigate();
  const { account } = useEthers();
  const { refetch } = useGetUserAssetsQuery(account) || null;
  const assetList = useCreatedList();
  const [flag, setFlag] = useBoolean(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const [distanceTime, setDistanceTime] = useState("");
  const updateTime = useSelector((state: RootState) => state.assets.updateTime);

  useEffect(() => {
    if (updateTime) setDistanceTime(`Updated ${formatDistanceToNowStrict(updateTime)}`);
  }, [currentTime, updateTime]);

  return (
    <TabPanel>
      {/* https://opensea.io/collection/doodles-official
                위 사이트와 같이 FilterWrap이 header의 bottom 에 붙을 경우
                className="fixed" 추가
            */}
      <FilterWrap className="">
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
            <SortingMenu />
          </Show>
          <Show breakpoint="(min-width: 1024px)">
            <GridAlign mode={viewMode} onChange={(m) => setViewMode(m)} />
          </Show>
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
          <Flex px="10px">
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
              <Text variant="txt174" color="White">
                {`${assetList?.length && numberFormat.format(assetList.length)}
                ${assetList.length < 2 ? "item" : "items"}`}
              </Text>
            )}
          </Flex>

          {/* grid */}
          {viewMode === ViewMode.GRID ? (
            <CollectionAssetCardView assets={assetList} isTransaction={false} />
          ) : (
            <CollectionAssetListView assets={assetList} />
          )}
        </Box>
      </HStack>

      <Flex>
        <Spacer />
        <Button
          variant="primary"
          size={{ base: "lg", md: "md" }}
          onClick={() => navigate("/importNFT")}
        >
          IMPORT
        </Button>
      </Flex>
      {/*<CollectedList />*/}
    </TabPanel>
  );
}
