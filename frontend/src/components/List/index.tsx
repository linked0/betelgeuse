import React from "react";
import styled from "styled-components";
import {
  AspectRatio,
  Flex,
  Image,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { useGetUserAssetsQuery } from "../../hooks/query/useGetUserAssetsQuery";
import { useEthers } from "@usedapp/core";
import { Link } from "react-router-dom";
import { useCollectedList } from "../../features/asset/assetsSlice";

export default function CollectedList() {
  const { account } = useEthers();
  const { data, loading } = useGetUserAssetsQuery(account) || null;

  const userAssets = useCollectedList();

  // console.log("userAssets :", userAssets);
  // console.log("userAssets.length :", userAssets.length);

  const renderCards = () => {
    return userAssets.map((data: any, index: number) => {
      return (
        <LinkBox as="article" maxW="sm" key={index}>
          <AspectRatio maxW="560px" ratio={43 / 37}>
            <Image src={data.thumbnailUrl} alt="mylist" height="auto"></Image>
          </AspectRatio>
          <Flex>
            <LinkOverlay
              as={Link}
              to={`/assets/${data.assetContractAddress}/${data.tokenId}`}
              noOfLines={1}
            >
              {data.name}
            </LinkOverlay>
            <Spacer />
          </Flex>
        </LinkBox>
      );
    });
  };

  return (
    <>
      {userAssets.length > 0 ? (
        <CollectedListWrap
          columns={[2, 2, 2, 2, 3, 4, 6]}
          spacing={["12px", "12px", "20px", "25px"]}
          mt="23px"
        >
          {renderCards()}
        </CollectedListWrap>
      ) : (
        <ListNone>
          <Text className="none-lst" fontSize={["24px", "22px"]}>
            No NFTs to display
          </Text>
        </ListNone>
      )}
    </>
  );
}

const CollectedListWrap = styled(SimpleGrid)`
  .chakra-linkbox {
    display: block;
    padding-bottom: 5px;
    border-radius: 10px;
    background: var(--chakra-colors-boa-3);
    > div {
      flex-direction: column-reverse;
      padding: 18px 15px;
      background: transparent;
      em {
        font-weight: 600;
        font-size: 14px;
        font-style: normal;
      }
      a {
        width: 100%;
        margin-top: 7px;
        font-weight: 600;
        font-size: 18px;
      }
    }
  }
  .chakra-image {
    display: block;
    object-fit: contain;
    object-position: 50% 50%;
    border-radius: 10px;
  }
  @media screen and (min-width: 744px) {
    .chakra-linkbox > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding-top: 10px;
      padding-bottom: 10px;
      a {
        width: calc(100% - 50px);
        margin-top: 0;
        font-size: 19px;
      }
      em {
        font-size: 19px;
      }
    }
  }
  @media screen and (min-width: 1024px) {
    .chakra-linkbox > div {
      padding-top: 14px;
      padding-bottom: 11px;
      a {
        font-size: 16px;
      }
      em {
        font-size: 16px;
      }
    }
  }
`;

const ListNone = styled.div`
  margin: 80px auto 0;
  text-align: center;
  font-weight: 500;
  font-size: 18px;
  color: #c4c4d3;
  &::before {
    content: "";
    display: block;
    width: 128px;
    height: 128px;
    margin: 0 auto 10px;
    background: url(/images/comm/img-none.svg) 50% 50% no-repeat;
  }
`;
