import React from "react";
import styled from "styled-components";
import { Box, Heading, Text } from "@chakra-ui/react";
import "@kfonts/nanum-square-ac";
import SlickIntro from "../../components/home";
import CommingItem from "../../components/home/CommingItem";
import SupportItem from "../../components/home/SupportItem";

export default function My() {
  return (
    <>
      <SlickIntro />

      <Box as="section" mt={["72px", "72px", "72px", "87px", "65px", "88px"]}>
        <Textarea>
          <Heading as="h2">Upcoming Items</Heading>
          <Text>Look forward to the upcoming NFT</Text>
        </Textarea>
        <CommingItem />
      </Box>

      <Box as="section" mt={["67px", "67px", "67px", "87px", "76px", "100px"]}>
        <Textarea>
          <Heading as="h2">Supported by</Heading>
          <Text>Item providers and Partners</Text>
        </Textarea>
        <SupportItem />
      </Box>
    </>
  );
}

const Textarea = styled.div`
  text-align: center;

  h2 {
    font-size: 36px;
    font-weight: 600;
    text-align: center;
  }

  p {
    padding-top: 10px;
    font-size: 18px;
    font-weight: 500;
    line-height: 25px;
    color: #9f9fba;
  }

  @media screen and (min-width: 744px) {
    h2 {
      font-size: 40px;
    }
  }
  @media screen and (min-width: 1024px) {
    h2 {
      font-size: 32px;
    }
    p {
      font-size: 16px;
    }
  }
`;
