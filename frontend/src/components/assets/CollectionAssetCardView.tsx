import React from "react";
import { SimpleGrid } from "@chakra-ui/react";
import AssetCard from "./assetCard";
import { EmptyList } from "../collection/EmptyList";

interface CollectionAssetCardViewProps {
  assets?: any[];
  isTransaction?: boolean;
}
export default function CollectionAssetCardView({
  assets,
  isTransaction = true,
}: CollectionAssetCardViewProps) {
  return (
    <SimpleGrid
      // columns={[2, 2, 2, 3]}
      minChildWidth={["184px", "184px", "184px", "184px", "264px"]}
      spacing={["8px", "8px", "8px", "8px", "20px"]}
      my="20px"
    >
      {assets && assets.length > 0 ? (
        assets.map((asset: any, index: number) => {
          return <AssetCard key={index} asset={asset} isTransaction={isTransaction} />;
        })
      ) : (
        <EmptyList />
      )}
    </SimpleGrid>
  );
}
