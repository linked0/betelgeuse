import React from "react";
import { Button, Image, useClipboard, VisuallyHidden } from "@chakra-ui/react";

export default function ChainColl() {
  const { onCopy } = useClipboard(window.location.href);
  return (
    <Button variant="circle" w="48px" h="48px" onClick={onCopy}>
      <Image src="/images/icon/chain.svg" alt="" />
      <VisuallyHidden>CopyLink</VisuallyHidden>
    </Button>
  );
}
// top="6px" left="40px"
