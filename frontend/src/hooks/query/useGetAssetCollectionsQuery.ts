import { gql, useQuery } from "@apollo/client";

export const GetAssetCollectionsQueryGQL = gql`
  query GetAssetCollections($category: Float) {
    GetAssetCollections(category: $category) {
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
        userAddress
      }
    }
  }
`;

export const useGetAssetCollectionsQuery = (category: number) => {
  const { data } = useQuery(GetAssetCollectionsQueryGQL, {
    variables: { category },
    onCompleted(data) {
      console.log("useGetAssetCollectionsQuery >:", data);
    },
    onError(err) {
      console.log("useGetAssetCollectionsQuery > error:", err);
    },
    fetchPolicy: "no-cache",
  });
  return data;
};
