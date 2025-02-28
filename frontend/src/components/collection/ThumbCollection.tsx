import React, { useState } from "react";
import styled from "styled-components";
import {
  Box,
  Button,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from "@chakra-ui/react";
import VerifiedIcon from "../icon/Verified";
import { useNavigate } from "react-router-dom";
import { useEthers } from "@usedapp/core";

interface ThumbCollectionProps {
  collection?: any;
}
export default function ThumbCollection({ collection }: ThumbCollectionProps) {
  const navigate = useNavigate();
  const { account } = useEthers();
  const [isOption, setOption] = useState(false);

  const handlerOnClick = (e: any) => {
    if (e.target.nodeName !== "BUTTON") {
      if (collection) {
        navigate(`/collection/${collection.url}`);
      } else {
        navigate(`/collection`);
      }
    }
  };

  const handlerOver = () => {
    if (collection?.creator?.userAddress === account) {
      setOption(true);
    }
  };

  const handlerOut = () => {
    setOption(false);
  };

  const handlerOnEdit = () => {
    navigate(`/collections/edit/${collection.url}`);
    console.log("Editor Click");
  };

  // const handlerCreatorEarnings = () => {
  //   console.log("Creator Earning Click");
  // };

  return (
    <BoxThumb
      pos="relative"
      overflow="hidden"
      borderRadius="10px"
      bg="popup_BBGG"
      onMouseOver={handlerOver}
      onMouseOut={handlerOut}
      className="hand"
      onClick={handlerOnClick}
    >
      {/* pb로 이미지 사이즈 조절하시면 됩니다. */}
      <Box pos="relative" overflow="hidden" w="100%" h="302px" m="0 !important">
        <Image
          src={
            collection?.featureUrl ??
            "https://i.seadn.io/gcs/files/ea3c15935f9142ecb0a8d20398281841.png?auto=format&w=256"
          }
          alt=""
          w="100%"
          objectFit="cover"
          objectPosition="50% 50%"
          pos="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        />
      </Box>
      <Box
        className="txt_wrap"
        pos="absolute"
        left="0"
        right="0"
        bottom="0"
        h="77px"
        px="17px"
        bg="popup_hover"
      >
        <HStack spacing="15px">
          <Box
            overflow="hidden"
            pos="relative"
            w="70px"
            h="70px"
            mt="-10px"
            background="#BCBCCB"
            border="3px solid #2C273F"
            borderRadius="10px"
          >
            <Image
              src={
                collection?.logoUrl ??
                "https://i.seadn.io/gcs/files/ea3c15935f9142ecb0a8d20398281841.png?auto=format&w=256"
              }
              alt=""
              objectFit="cover"
              objectPosition="50%"
            />
          </Box>
          <Box display="flex" alignItems="baseline">
            <Text variant="txt176" transform="translateY(3px)">
              {collection?.name ?? "Faker Collection Totem"}
            </Text>
            <Box display="inline-block" transform="scale(0.8)">
              <VerifiedIcon />
            </Box>
          </Box>
        </HStack>
      </Box>
      <Stack alignItems="flex-end" spacing="5px" pos="absolute" top="0" right="0" p="14px">
        {isOption && (
          <React.Fragment>
            <Menu closeOnSelect={true}>
              <MenuButton
                as={Button}
                variant="gray4"
                minW="0"
                w="30px"
                h="30px"
                p="0"
                borderRadius="6px"
                boxShadow="15px 15px 28px rgba(0, 0, 0, 0.3)"
                bg="#443F5B"
              >
                <Image src="/images/icon/ham.svg" />
              </MenuButton>
              <MenuList boxShadow="15px 15px 28px rgba(0, 0, 0, 0.3)">
                <MenuItem
                  as={Button}
                  icon={
                    <span className="material-symbols-outlined fill" style={{ fontSize: "24px" }}>
                      edit
                    </span>
                  }
                  display="flex"
                  justifyContent="flex-start"
                  w="100%"
                  bg="popup_B01"
                  _hover={{
                    bg: "popup_hover",
                  }}
                  onClick={handlerOnEdit}
                >
                  Edit
                </MenuItem>
                {/*<MenuItem
                  as={Button}
                  icon={
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                      attach_money
                    </span>
                  }
                  display="flex"
                  justifyContent="flex-start"
                  w="100%"
                  onClick={handlerCreatorEarnings}
                >
                  Creator earnings
                </MenuItem>*/}
              </MenuList>
            </Menu>
          </React.Fragment>
        )}
      </Stack>
    </BoxThumb>
  );
}

const BoxThumb = styled(Box)`
  &:hover {
    .txt_wrap {
      background: transparent;
    }
  }
`;
