import { gql, useQuery } from "@apollo/client";
import { removeJWT } from "../../features/auth/authSlice";
import { useDispatch } from "react-redux";
import { changeCollectedList, changeCreatedList } from "../../features/asset/assetsSlice";

export const GetUserAssetsQueryGQL = gql`
  query GetUserAssets($userAddress: String!) {
    GetUserAssets(userAddress: $userAddress) {
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
      creator {
        id
        userAddress
      }
      assetCollection {
        name
      }
      owners {
        unitPrice
        user {
          userAddress
        }
        amount
      }
    }
  }
`;

export const useGetUserAssetsQuery = (account: string) => {
  const dispatch = useDispatch();
  const { data, loading, refetch } = useQuery(GetUserAssetsQueryGQL, {
    variables: { userAddress: account },
    onCompleted(data) {
      console.log("getUserAssetsGQL >:", data);
      if (data?.GetUserAssets) {
        dispatch(changeCollectedList(data.GetUserAssets));
        dispatch(
          changeCreatedList(
            data.GetUserAssets.filter((asset: any) => asset.creator.userAddress === account)
          )
        );
      }
    },
    onError(err) {
      if (err.toString().includes("user not found")) {
        dispatch(removeJWT(account));
        console.log("YOU NEED LOGIN");
      } else {
        console.log("getUserAssetsGQL > error:", err);
      }
    },
    // fetchPolicy: "no-cache",
  });
  return { data, loading, refetch };
};
