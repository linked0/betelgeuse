import React from "react";
import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import styled from "styled-components";
import { shortNumberFormat } from "../../utils/Format";

interface CollectionStatisticsProps {
  items?: number;
  owners?: number;
  volume?: number;
  floor?: number;
  royalty?: number;
}
export function CollectionStatistics({
  items = NaN,
  owners = NaN,
  volume = NaN,
  floor = NaN,
  royalty = NaN,
}: CollectionStatisticsProps) {
  return (
    <SimpleGrid
      display={["grid", "grid", "grid", "inline-grid", "inline-grid"]}
      spacing={["19px", "19px", "19px", "42px", "42px"]}
      mt="24px"
      flexWrap="wrap"
      columns={[3, 3, 3, 5, 5]}
    >
      <FresnEl>
        <Text as="strong" variant="txt154">
          Items
        </Text>
        <Text variant="txt226" lineHeight="1.1">
          {isNaN(items) ? "--" : shortNumberFormat(items)}
        </Text>
      </FresnEl>

      <FresnEl>
        <Text as="strong" variant="txt154">
          Owners
        </Text>
        <Text variant="txt226" lineHeight="1.1">
          {isNaN(owners) ? "--" : shortNumberFormat(owners)}
        </Text>
      </FresnEl>

      {!isNaN(volume) && (
        <FresnEl>
          <Text as="strong" variant="txt154">
            VOL.
          </Text>
          <Text variant="txt226" lineHeight="1.1">
            {volume}
          </Text>
        </FresnEl>
      )}

      {!isNaN(floor) && (
        <FresnEl>
          <Text as="strong" variant="txt154">
            Floor
          </Text>
          <Text variant="txt226" lineHeight="1.1">
            {floor}
          </Text>
        </FresnEl>
      )}

      <FresnEl>
        <Text as="strong" variant="txt154">
          Royalty
        </Text>
        <Text variant="txt226" lineHeight="1.1">
          {isNaN(royalty) ? "--" : `${royalty}%`}
        </Text>
      </FresnEl>
    </SimpleGrid>
  );
}

const FresnEl = styled(Box)`
  position: relative;
  &:first-child::before,
  &:nth-child(4)::before {
    display: none;
  }
  &::before {
    content: "";
    position: absolute;
    top: 5px;
    left: -18px;
    width: 1px;
    height: 41px;
    background-color: #443f5b;
  }
  strong {
    display: block;
    margin-bottom: 5px;
    color: #706d82;
  }
  @media screen and (min-width: 744px) {
    &:nth-child(4)::before {
      display: block;
    }
    &::before {
      left: -32px;
    }
    &:last-child::after {
      content: "";
      position: absolute;
      top: 5px;
      right: -10px;
      width: 1px;
      height: 41px;
      background-color: #443f5b;
    }
  }
`;
