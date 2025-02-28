import React, { ReactElement } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Image,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { formatEther } from "ethers/lib/utils";
import { shotAddress } from "../../../utils/WalletUtils";
import { formatDistance } from "date-fns";
import { ActivityType } from "../../../type";
import { Link } from "react-router-dom";

interface ActivityListProps {
  activities?: any;
}
export default function ActivityList({ activities }: ActivityListProps) {
  return (
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
                    const isCanceled =
                      ["LIST", "OFFER"].includes(data.activityType) &&
                      data.order.status === "CANCELED";
                    const date = formatDistance(new Date(data.createdAt), new Date(), {
                      addSuffix: true,
                    });
                    return (
                      <Tr key={index}>
                        <Th>
                          {getEventType(data.activityType)}
                          {isCanceled && (
                            <Box as="span" fontSize={11} ml={2} color="#EB5757">
                              Canceled
                            </Box>
                          )}
                        </Th>
                        <Td
                          style={
                            isCanceled
                              ? { textDecoration: "line-through", textDecorationColor: "#FFFFFF" }
                              : undefined
                          }
                        >
                          {amount
                            ? `${amount} ${data?.order?.offerType === "OFFERING" ? "WBOA" : "BOA"}`
                            : null}
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
                          {/*<Tooltip
                                  label="Supply Tooltip"
                                  placement="top"
                                  hasArrow
                                  arrowSize={10}
                                >
                                  <InfoIcon ml="5px" color="Point_Red" fontSize="16px" />
                                </Tooltip>*/}
                        </Td>
                        <Td>
                          {data?.txHash ? (
                            <Link
                              to={`${process.env.REACT_APP_BOA_SCAN_URL}${data.txHash}`}
                              target="_blank"
                            >
                              <span className="blue ellipsis">{date}</span>
                            </Link>
                          ) : (
                            date
                          )}
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
  );
}
export const getEventType = (type: ActivityType): ReactElement => {
  if (type === ActivityType.MINTED) {
    return (
      <>
        <span className="material-symbols-outlined fill">auto_awesome</span>
        Minted
      </>
    );
  } else if (type === ActivityType.CANCEL) {
    return (
      <>
        <span className="material-symbols-outlined fill">cancel</span>
        Cancel
      </>
    );
  } else if (type === ActivityType.LIST) {
    return (
      <>
        <span className="material-symbols-outlined fill">sell</span>
        List
      </>
    );
  } else if (type === ActivityType.SELL) {
    return (
      <>
        <span className="material-symbols-outlined fill">shopping_cart</span>
        Sale
      </>
    );
  } else if (type === ActivityType.OFFER) {
    return (
      <>
        <Image src="/images/icon/approval_delegation.svg" />
        Offer
      </>
    );
  } else if (type === ActivityType.TRANSFER) {
    return (
      <>
        <span className="material-symbols-outlined fill">multiple_stop</span>
        Transfer
      </>
    );
  }
  return null;
};
