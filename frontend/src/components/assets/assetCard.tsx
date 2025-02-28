import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import { Badge, Box, Button, HStack, Text } from "@chakra-ui/react";
import ThumbRatio from "../ThumbRatio";
import { useNavigate } from "react-router-dom";
import { useEthers } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";
import { FavoriteIcon } from "../Button/Favorite";

interface AssetProps {
  asset?: any;
  isTransaction?: boolean;
}
export default function AssetCard({ asset, isTransaction = true }: AssetProps) {
  const navigate = useNavigate();
  const { account } = useEthers();
  const handlerOnClick = () => {
    navigate(`/assets/${asset?.assetContractAddress}/${asset?.tokenId}`);
  };

  const { price, amount } = useMemo(() => {
    if (asset?.owners?.length) {
      const my = asset.owners.filter((owner: any) => owner.user.userAddress === account);
      if (my.length) {
        return { amount: my[0].amount ?? 0, price: my[0].unitPrice ?? 0 };
      }
    }
    return {
      amount: 0,
      price: 0,
    };
  }, [asset, account]);

  return (
    <MoreCollectionWrap
      overflow="hidden"
      pos="relative"
      // w={["50%", "50%", "50%", "50%", "33.333%", "25%", "20%"]}
      // maxWidth="335px"
      w="100%"
      bg="popup_B01"
      borderRadius="10px"
      flexShrink="0"
      className="collectionEl"
      onClick={handlerOnClick}
      $isTransaction={isTransaction}
    >
      <ThumbRatio src={asset?.originalUrl ?? "/images/symbol/boa.svg"} />
      {amount > 1 && (
        <CountBadge variant="solid" colorScheme="purple">
          {`x${amount}`}
        </CountBadge>
      )}

      <Box pos="relative" className="txt-wrap" p="15px" bg="popup_hover" pb="42px">
        <Text
          variant="txt155"
          overflow="hidden"
          maxW="70%"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          color="White"
        >
          {asset?.name}
        </Text>
        {/* search 페이지만 노출 */}
        <HStack>
          <Text
            variant="txt155"
            overflow="hidden"
            maxW="70%"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            color="White"
          >
            {asset?.assetCollection?.name}
          </Text>{" "}
          {/*
            TODO : Verified feature
          <Box transform="scale(0.8) translate(-10px, -2px)" transformOrigin="0 50%">
            <VerifiedIcon />
          </Box>*/}
        </HStack>
        {price > 0 && <Text variant="txt165">{`${formatEther(price)} BOA`}</Text>}
        <Box pos="absolute" zIndex="100" top="12px" right="16px">
          <FavoriteIcon assetData={asset} viewMode={true} />
        </Box>
      </Box>
      <HStack className="btn-wrap" pos="absolute" bottom="0" left="0" right="0" w="100%">
        <Button
          variant="primary"
          borderRadius="0"
          w={["35%", "35%", "35%", "50%"]}
          h="38px"
          borderRightWidth="1px"
          borderColor="#2C273F"
          fontSize="15px"
          fontWeight="600"
          leftIcon={<span className="material-symbols-outlined fill">shopping_cart</span>}
        >
          Add
        </Button>
        <Button
          variant="primary"
          w={["65%", "65%", "65%", "50%"]}
          h="38px"
          borderRadius="0"
          m="0 !important"
          borderLeftWidth="1px"
          borderColor="#BCBCCB"
          fontSize="15px"
          fontWeight="600"
          leftIcon={<span className="material-symbols-outlined fill">bolt</span>}
        >
          Buy now
        </Button>
      </HStack>
    </MoreCollectionWrap>
  );
}

const CountBadge = styled(Badge)`
  position: absolute;
  left: 10px;
  top: 10px;
  border-radius: 5px !important;
  background-color: #a796ff;
  text-transform: none !important;
`;

const MoreCollectionWrap = styled(Box)`
  position: relative;
  cursor: pointer;
  ${(props) =>
    props.isTransaction &&
    css`
      &:hover {
        .txt-wrap {
          background: #46405f;
        }
        .btn-wrap {
          display: block;
        }
      }
    `};
  .btn-wrap {
    display: none;
  }
`;
