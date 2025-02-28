import React from "react";
import {
  Badge,
  Box,
  Checkbox,
  HStack,
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
import VerifiedIcon from "../icon/Verified";
import { EmptyList } from "./EmptyList";
import { formatDistance } from "date-fns";
import { useNavigate } from "react-router-dom";

interface CollectionAssetListViewProps {
  assets?: any[];
}
export function CollectionAssetListView({ assets }: CollectionAssetListViewProps) {
  const navigate = useNavigate();
  const handlerOnClick = (asset: any) => {
    navigate(`/assets/${asset?.assetContractAddress}/${asset?.tokenId}`);
  };

  return (
    <React.Fragment>
      {assets && assets.length ? (
        <TableContainer mt="20px">
          <Table variant="main">
            <Thead>
              <Tr>
                <Th w="30px"></Th>
                <Th>Item</Th>
                <Th>Current Price</Th>
                <Th>Best Offer</Th>
                <Th>Last Sale</Th>
                <Th>Owner</Th>
                <Th>Time Listed</Th>
              </Tr>
            </Thead>
            <Tbody>
              {assets.map((v) => {
                return (
                  <Tr key={v.id}>
                    <Td>
                      <Checkbox />
                    </Td>
                    <Td onClick={() => handlerOnClick(v)} className="hand">
                      <HStack spacing="15px">
                        <Box overflow="hidden" w="40px" h="40px" bg="popup_BBGG" borderRadius="8px">
                          <Image
                            src={v.originalUrl}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                            objectPosition="50% 50%"
                          />
                        </Box>
                        <Text variant="txt156">{v.name}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      {v?.unitPrice ? (
                        <Badge variant="gray">
                          {`${v?.unitPrice} BOA`}
                          {/*<Image src="/images/icon/bolt.svg" />*/}
                        </Badge>
                      ) : (
                        "--"
                      )}
                    </Td>
                    <Td>{v?.baseOffer ? "1.5505 BOA" : "--"}</Td>
                    <Td>{v?.lastSale ? "1.5505 BOA" : "--"}</Td>
                    <Td>
                      {v?.owner ? (
                        <span className="blue">you</span>
                      ) : (
                        <>
                          <span className="blue">you</span>
                          <VerifiedIcon />
                        </>
                      )}
                    </Td>
                    <Td>
                      {v?.updatedAt &&
                        formatDistance(new Date(v.updatedAt), Date.now(), {
                          addSuffix: true,
                        })}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <EmptyList />
      )}
    </React.Fragment>
  );
}
