import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Avatar,
  Box,
  Divider,
  Flex,
  Heading,
  Image,
  Link as NLink,
  Spacer,
  StackDivider,
  Text,
  Tooltip,
  useClipboard,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
  HStack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import WalletItem from "./WalletItem";
import { useActiveState } from "../../hooks/useActiveState";
import { ACTIVE_STATE } from "../../constants";
import Identicon from "../Identicon";
import { useEtherBalance, useEthers, useTokenBalance } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";
import { BigNumber } from "ethers";
import { WBOA9 } from "../../hooks/useSeaport";
import { WrapModal } from "../Modals/Wrap";
import { getUSDPrice, useBOAPrice } from "../../features/price/boaPriceSlice";
import { useGetMyInfo } from "../../hooks/query/useGetMyInfo";
import { shotAddress } from "../../utils/WalletUtils";

interface ConnectSelectProps {
  onClose?: any;
}

export default function ConnectSelect({ onClose }: ConnectSelectProps) {
  const { account } = useEthers();
  const etherBalance = useEtherBalance(account);
  const { onCopy, setValue } = useClipboard("");
  const { activeState } = useActiveState();
  const wBOABalance: BigNumber = useTokenBalance(WBOA9, account);
  const usd = useBOAPrice();
  const [total, setTotal] = useState("");

  const myInfo = useGetMyInfo();
  const profile = useMemo(() => {
    if (myInfo?.getMyInfo) {
      return myInfo?.getMyInfo?.profile;
    }
    return {};
  }, [myInfo]);

  useMemo(() => {
    if (onClose) console.log("usememo > activeState:", activeState);
    return activeState;
  }, [activeState, onClose]);

  useMemo(() => {
    setValue(account);
  }, [account, setValue]);

  console.log("account:", account);
  const wrapModal = useDisclosure();

  useEffect(() => {
    if (etherBalance) {
      etherBalance && console.log("BOA:", etherBalance.toString());
      wBOABalance && console.log("WBOA", wBOABalance.toString());
      let t = BigNumber.from(0);
      t = t.add(etherBalance);
      if (wBOABalance) t = t.add(wBOABalance);
      const us = getUSDPrice(t.toString(), usd);
      setTotal(us);
    } else {
      setTotal("$0.00");
    }
  }, [etherBalance, wBOABalance, usd]);

  return (
    <>
      {activeState !== ACTIVE_STATE.STATUS_ONLINE ? (
        <ConnectWrap>
          <Box pt="40px" className="">
            <Heading as="h2" fontSize="24px" fontWeight={600} lineHeight="35px">
              Connect your wallet
            </Heading>
            <Text pt="13px" fontSize="15px" fontWeight={600} color="text_Gray02">
              If you don&apos;t have a{" "}
              <NLink>
                <Text as="span" color="#FF204A">
                  <span onClick={() => window.open("https://metamask.io/download/", "_blank")}>
                    wallet
                  </span>
                </Text>
              </NLink>{" "}
              yet, <br className="cut2" /> you can select a provider and create one now.
            </Text>
          </Box>
          <VStack align="stretch" className="box" mt="28px" borderRadius="8px" bg="popup_BBG">
            <WalletItem />
          </VStack>
        </ConnectWrap>
      ) : (
        <>
          <Box px="20px" pt={["23px", "23px", "23px", "95px", "95px"]}>
            <Link to="#" onClick={onClose}>
              <HStack>
                <span className="material-symbols-outlined" style={{ transform: "rotate(90deg)" }}>
                  expand_more
                </span>
                <Text variant="txt166">My Wallet</Text>
              </HStack>
            </Link>
            <Divider my="30px" borderColor="#443F5B" />
            <UserWrap>
              <Box className="userImg" w="42px" h="42px" mr="10px">
                {profile?.image ? (
                  <Avatar size="100%" src={profile.image} name={profile.name} />
                ) : (
                  <Identicon />
                )}
              </Box>
              <VStack spacing="3px">
                <Text variant="txt216" lineHeight="1">
                  {profile?.name ? profile.name : "Unnamed"}
                </Text>
                <Text variant="txt114" color="#C4C4D3" mt="6px !important">
                  {account && shotAddress(account)}
                  <Tooltip hasArrow label="Copy!!" bg="red.600">
                    <NLink>
                      <span
                        className="material-symbols-outlined"
                        onClick={onCopy}
                        style={{ transform: "scaleY(0.8)" }}
                      >
                        content_copy
                      </span>
                    </NLink>
                  </Tooltip>
                </Text>
              </VStack>
            </UserWrap>

            <WalletInfo
              divider={<StackDivider borderColor="gray.600" />}
              spacing={["13px", "13px", "13px", "8px"]}
              align="stretch"
            >
              <Flex px="18px">
                <Heading as="h2" fontSize="12px" fontWeight="600" color="#C4C4D3">
                  WALLET
                </Heading>
                <Spacer />
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#A796FF", fontSize: "16px" }}
                >
                  swap_horiz
                </span>
                <SwapBtn
                  onClick={() => {
                    wrapModal.onOpen();
                  }}
                >
                  <Text variant="txt126" color="#A796FF">
                    Swap
                  </Text>
                  {/* <Text variant="txt126" color="secondary_V">Wrap</Text> */}
                </SwapBtn>
              </Flex>
              <Wrap pb={1} px="18px">
                <WrapItem display="flex" w="100%" py={2}>
                  <Box display="flex">
                    <Image src="/images/symbol/boa.svg" mr={3} />
                    <Box>
                      <Text as="b" fontSize="18px" fontWeight={600} lineHeight="27px">
                        BOA
                      </Text>
                      <Text fontSize="12px" fontWeight={400} color="text_Gray02">
                        BOSagora
                      </Text>
                    </Box>
                  </Box>
                  <Spacer />
                  <Box>
                    <Text
                      as="b"
                      fontSize="17px"
                      fontWeight={600}
                      lineHeight="27px"
                      textAlign="right"
                    >
                      {etherBalance && formatEther(etherBalance).split(".")[0]}
                    </Text>
                    <Text fontSize="12px" fontWeight={400} textAlign="right" color="#C4C4D3">
                      {etherBalance && getUSDPrice(etherBalance.toString(), usd)}
                    </Text>
                  </Box>
                </WrapItem>
                {wBOABalance && !wBOABalance.isZero() && (
                  <>
                    <Divider />
                    <WrapItem display="flex" w="100%" py={2}>
                      <Box display="flex">
                        <Image src="/images/symbol/wboa.svg" mr={3} />
                        <Box>
                          <Text
                            as="b"
                            fontSize={["22px", "22px", "22px", "18px"]}
                            fontWeight={600}
                            lineHeight="27px"
                          >
                            WBOA
                          </Text>
                          <Text fontSize={["14px", "14px", "14px", "12px"]} fontWeight={400}>
                            BOSagora
                          </Text>
                        </Box>
                      </Box>
                      <Spacer />
                      <Box>
                        <Text
                          as="b"
                          fontSize={["20px", "20px", "20px", "17px"]}
                          fontWeight={500}
                          lineHeight="27px"
                          textAlign="right"
                        >
                          {wBOABalance && formatEther(wBOABalance)}
                        </Text>
                        <Text
                          fontSize={["14px", "14px", "14px", "12px"]}
                          fontWeight={400}
                          textAlign="right"
                        >
                          {wBOABalance && getUSDPrice(wBOABalance.toString(), usd)}
                        </Text>
                      </Box>
                    </WrapItem>
                  </>
                )}
                <Flex
                  w="100%"
                  m="13px 0 0 0 !important"
                  pt="20px"
                  pb="2px"
                  borderTopWidth="1px"
                  borderColor="#4F4B67"
                >
                  <Text variant="txt124" color="text_Gray02">
                    Total Balance{" "}
                  </Text>
                  <Spacer />
                  <Text variant="txt176" mt="0">
                    {total}
                  </Text>
                </Flex>
              </Wrap>
            </WalletInfo>

            <WrapModal isOpen={wrapModal.isOpen} onClose={wrapModal.onClose} />
          </Box>
        </>
      )}
    </>
  );
}

const SwapBtn = styled.div`
  cursor: pointer;
  padding: 0 5px;
`;
const ConnectWrap = styled(Box)`
  width: 100%;
  margin: 0 auto;
  padding-bottom: 50px;
  .modal {
    .box {
      > div {
        margin-bottom: 20px;
      }
    }
    .txt-your {
      display: inline-block;
    }
  }
`;
const WalletInfo = styled(VStack)`
  padding: 16px 0 16px;
  background: #2a253d;
  border: 1px solid #413c5a;
  border-radius: 8px;
  /* opacity: 0.7; */
  @media screen and (min-width: 744px) {
    margin-top: 26px;
    padding-bottom: 10px;
  }
`;
const UserWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0 23px;
  > div {
    align-items: flex-start;
  }
  strong {
    display: block;
    font-weight: 600;
    font-size: 26px;
    line-height: 31px;
  }
  p {
    span {
      display: inline-block;
      margin: -3px 0 0 7px;
      vertical-align: middle;
    }
  }
`;
