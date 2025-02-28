import React from "react";

import { Button, Flex, Image, useClipboard, VisuallyHidden, Tooltip } from "@chakra-ui/react";

export default function LinkShare() {
  const { onCopy } = useClipboard(window.location.href);
  return (
    <Flex pos="absolute" top="0" right="0" w="48px" h="48px" borderRadius="50%" bg="#443F5B">
      <Tooltip label="Copy Link" aria-label="A tooltip" placement="top" hasArrow>
        <Button
          onClick={onCopy}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {/* <span className="material-symbols-outlined">share</span> */}
          <Image src="/images/icon/link_chain.svg" />
          <VisuallyHidden>share</VisuallyHidden>
        </Button>
      </Tooltip>
    </Flex>
  );
}
