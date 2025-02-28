import { gql, useQuery } from "@apollo/client";

export const GetAssetCollectionByNameQueryGQL = gql`
  query GetAssetCollectionByName($name: String!) {
    GetAssetCollectionByName(name: $name) {
      ... on AssetCollection {
        id
        createdAt
        updatedAt
        name
        url
        description
        logoUrl
        featureUrl
        bannerUrl
        webLink
        mediumLink
        telegramLink
        categoryType
        creator {
          id
          userAddress
          profile {
            id
            createdAt
            updatedAt
            image
            name
            bio
            twitter
            youtube
            instagram
            homepage
          }
        }
        feeCollectors {
          fee
          user {
            userAddress
          }
        }
        assets {
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
          externalLink
          attribute
          metadataLink
          backgroundColor
          totalSupply
          viewCount
          owners {
            amount
            user {
              userAddress
            }
          }
        }
      }
    }
  }
`;

export const GetAssetCollectionByNameSimpleQueryGQL = gql`
  query GetAssetCollectionByName($name: String!) {
    GetAssetCollectionByName(name: $name) {
      ... on AssetCollection {
        id
        name
        url
        description
        logoUrl
        featureUrl
        bannerUrl
        webLink
        mediumLink
        telegramLink
        categoryType
        feeCollectors {
          fee
          user {
            userAddress
          }
        }
      }
    }
  }
`;

export const useGetAssetCollectionByNameQuery = (name: string) => {
  const { data } = useQuery(GetAssetCollectionByNameQueryGQL, {
    variables: { name },
    onCompleted(data) {
      console.log("useGetAssetCollectionByNameQuery >:", data);
    },
    onError(err) {
      console.log("useGetAssetCollectionByNameQuery > error:", err);
    },
    fetchPolicy: "no-cache",
  });
  return data;
};

export const useGetAssetCollectionByNameSimpleQuery = (name: string) => {
  const { data, loading } = useQuery(GetAssetCollectionByNameSimpleQueryGQL, {
    variables: { name },
    onCompleted(data) {
      console.log("GetAssetCollectionByNameSimpleQueryGQL >:", data);
    },
    onError(err) {
      console.log("GetAssetCollectionByNameSimpleQueryGQL > error:", err);
    },
    fetchPolicy: "no-cache",
  });
  return { data, loading };
};
