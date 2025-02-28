import { gql, useLazyQuery } from "@apollo/client";

export const GetAssetCollectionQueryGQL = gql`
  query GetAssetCollection($getAssetCollectionId: String!) {
    GetAssetCollection(id: $getAssetCollectionId) {
      ... on AssetCollection {
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
          metadataLink
          backgroundColor
          totalSupply
        }
      }
    }
  }
`;

export const useGetAssetCollectionQuery = () => {
  const [getAssetCollection, { data }] = useLazyQuery(GetAssetCollectionQueryGQL, {
    onCompleted(data) {
      console.log("GetAssetCollectionQuery >:", data);
    },
    onError(err) {
      console.log("GetAssetCollectionQuery > error:", err);
    },
    fetchPolicy: "no-cache",
  });
  return { getAssetCollection, data };
};
