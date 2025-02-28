import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { useEthers } from "@usedapp/core";
import { useActiveState } from "../useActiveState";

export const GetAssetDetailQueryGQL = gql`
  query GetAssetDetail($assetContractAddress: String, $tokenId: String) {
    GetAssetDetail(assetContractAddress: $assetContractAddress, tokenId: $tokenId) {
      ... on Asset {
        id
        createdAt
        updatedAt
        assetContractAddress
        tokenId
        name
        description
        originalUrl
        thumbnailUrl
        previewUrl
        metadataLink
        backgroundColor
        totalSupply
        viewCount
        updatedAt
        attribute
        externalLink
        assetContract {
          id
          contractAddress
          description
          imageUrl
          itemType
          metaType
          symbol
        }
        assetCollection {
          id
          name
          bannerUrl
          categoryType
          featureUrl
          logoUrl
          mediumLink
          telegramLink
          webLink
          feeCollectors {
            fee
            user {
              userAddress
            }
          }
          url
        }
        activities {
          id
          activityType
          createdAt
          from {
            id
            userAddress
          }
          amount
          to {
            id
            userAddress
          }
          txHash
          order {
            id
            createdAt
            offerType
            orderType
            status
            amount
            sold
            unitPrice
            offerer {
              id
              userAddress
            }
            originalData
            orderHash
            updatedAt
          }
        }
        creator {
          id
          userAddress
        }
        owners {
          id
          user {
            id
            userAddress
          }
          amount
        }
      }
    }
  }
`;

export const useGetAssetDetailQuery = (assetContractAddress: string, tokenId: string) => {
  const { account } = useEthers();
  const { online } = useActiveState();

  const { data } = useQuery(GetAssetDetailQueryGQL, {
    variables: { assetContractAddress, tokenId },
    onCompleted(data) {
      console.log("getAssetDetailQuery >:", data);
    },
    onError(err) {
      console.log("getAssetDetailQuery > error:", err);
    },
    // fetchPolicy: "no-cache",
  });
  return data;
};

export const GetAssetDetailSimpleQueryGQL = gql`
  query GetAssetDetail($assetContractAddress: String, $tokenId: String) {
    GetAssetDetail(assetContractAddress: $assetContractAddress, tokenId: $tokenId) {
      ... on Asset {
        id
        assetContractAddress
        tokenId
        name
        description
        originalUrl
        thumbnailUrl
        previewUrl
        metadataLink
        backgroundColor
        totalSupply
        attribute
        externalLink
        activities {
          id
          activityType
        }
        creator {
          id
          userAddress
        }
        assetCollection {
          id
          name
          logoUrl
        }
      }
    }
  }
`;

export const useGetAssetDetailSimpleQuery = () => {
  const [getAssetDetailSimple, { data }] = useLazyQuery(GetAssetDetailSimpleQueryGQL, {
    onCompleted(data) {
      console.log("getAssetDetailQuery >:", data);
    },
    onError(err) {
      console.log("getAssetDetailQuery > error:", err);
    },
    fetchPolicy: "no-cache",
  });
  return { getAssetDetailSimple, data };
};
