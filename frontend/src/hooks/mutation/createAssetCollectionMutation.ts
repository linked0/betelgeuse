import { gql, useMutation } from "@apollo/client";

const CREATE_ASSET_COLLECTION_MUTATION = gql`
  mutation CreateAssetCollection(
    $name: String!
    $logoUrl: String!
    $featureUrl: String
    $bannerUrl: String
    $description: String
    $category: Int!
    $webLink: String
    $mediumLink: String
    $telegramLink: String
    $feeCollectors: String
  ) {
    createAssetCollection(
      name: $name
      logoUrl: $logoUrl
      featureUrl: $featureUrl
      bannerUrl: $bannerUrl
      description: $description
      category: $category
      webLink: $webLink
      mediumLink: $mediumLink
      telegramLink: $telegramLink
      feeCollectors: $feeCollectors
    ) {
      ... on AssetCollection {
        id
      }
    }
  }
`;

export const useCreateAssetCollectionMutation = () => {
  const [createAssetCollectionMutation] = useMutation(CREATE_ASSET_COLLECTION_MUTATION);
  return { createAssetCollectionMutation };
};
