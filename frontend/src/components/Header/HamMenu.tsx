import React from "react";
import styled from "styled-components";
import {
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import Gnb from "./Gnb";
import ConnectButton from "../ConnectButton";

export default function HamMenu() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  return (
    <>
      <IconButton
        aria-label="Open Menu"
        display={["flex", "flex", "flex", "none"]}
        ml={3}
        icon={<HamburgerIcon />}
        onClick={onOpen}
      />
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBodyWrap justifyContent="space-between">
            <Gnb onClose={onClose} />
            <ConnectButton />
          </DrawerBodyWrap>
        </DrawerContent>
      </Drawer>
    </>
  );
}
const DrawerBodyWrap = styled(DrawerBody)`
  display: flex;
  flex-direction: column;
`;
