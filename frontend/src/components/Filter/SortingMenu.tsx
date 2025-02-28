import { Button, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import React, { useState } from "react";

export enum SortType {
  "Recently received",
  "Most viewed",
  "Price low to high",
  "Price high to low",
}
const SortTypeName = Object.keys(SortType).filter((v) => isNaN(Number(v)));

export const SortingMenu = ({
  onChange,
  filter = SortType[0],
}: {
  onChange?: any;
  filter?: string;
}) => {
  const [current, setCurrent] = useState(filter);

  const handlerOnChange = (select: number) => {
    setCurrent(SortType[select]);
    onChange && onChange(select);
  };
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        w="240px"
        h="52px"
        px="16px"
        borderColor="popup_B01"
        borderWidth="2px"
        borderRadius="8px"
        textAlign="left"
      >
        <Text variant="txt154">{current}</Text>
      </MenuButton>
      <MenuList width="auto">
        {SortTypeName.map((n: string, index: number) => {
          return (
            <MenuItem key={index} onClick={() => handlerOnChange(index)}>
              {n}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
};
