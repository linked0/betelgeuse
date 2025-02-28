import { useEthers } from "@usedapp/core";
import { useUserActivities } from "../../../hooks/query/useGetUserActivities";
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Show,
  Spacer,
  TabPanel,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import FiltersButton from "../../../components/collection/FiltersButton";
import FiltersEl from "../../../components/collection/FilterEl";
import { numberFormat } from "../../../utils/Format";
import ActivityEls from "../../../components/assets/ActivityEls";
import { FilterWrap } from "./CollectedTab";
import { MyTabProps } from "../index";
import { formatDistanceToNowStrict } from "date-fns";

export default function ActivityTab({ currentTime }: MyTabProps) {
  const { account } = useEthers();
  const [flag, setFlag] = useBoolean(true);
  const { data: activitiesData, refetch } = useUserActivities(account);

  const { activities, updateTime } = useMemo(() => {
    if (activitiesData && activitiesData.GetUserActivities) {
      return { activities: activitiesData.GetUserActivities, updateTime: Date.now() };
    }
    return { activities: [], updateTime: Date.now() };
  }, [activitiesData]);

  const [distanceTime, setDistanceTime] = useState("");

  useEffect(() => {
    if (updateTime) setDistanceTime(`Updated ${formatDistanceToNowStrict(updateTime)}`);
  }, [currentTime, updateTime]);

  return (
    <TabPanel>
      <FilterWrap className="">
        <FiltersButton onClick={setFlag.toggle} />
        {/*<HStack spacing="10px">
          <Show breakpoint="(min-width: 1024px)">
            <MostViewed />
          </Show>
          <Show breakpoint="(min-width: 1024px)">
            <GridAlign />
          </Show>
        </HStack>*/}
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
            <Text variant="txt176">
              {`${activities?.length && numberFormat.format(activities.length)} ${
                activities.length < 2 ? "item" : "items"
              }`}
            </Text>
          </Flex>

          {/* table */}
          <ActivityEls activities={activities} />
        </Box>
      </HStack>
    </TabPanel>
  );
}
