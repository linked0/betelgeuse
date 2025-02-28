import React, { useMemo } from "react";
import styled from "styled-components";
import { useClipboard, VStack, Tooltip, Link, Avatar } from "@chakra-ui/react";
import Identicon from "../Identicon";
import { useEthers } from "@usedapp/core";

export default function UserInfo({ profile }: { profile?: any }) {
  const { account } = useEthers();
  const { onCopy, setValue } = useClipboard("");

  useMemo(() => {
    setValue(account);
  }, [account, setValue]);

  return (
    <UserWrap>
      <AvatarWrap>
        {profile?.image ? (
          <Avatar size="100%" src={profile.image} name={profile.name} />
        ) : (
          <Identicon />
        )}
      </AvatarWrap>
      <VStack>
        <strong>{profile?.name ? profile.name : "Unnamed"}</strong>
        <p>
          {account &&
            `${account.slice(0, 6)}...${account.slice(account.length - 4, account.length)}`}{" "}
          <Tooltip hasArrow label="Copy!!" bg="red.600">
            <Link>
              <span className="material-symbols-outlined" onClick={onCopy}>
                content_copy
              </span>
            </Link>
          </Tooltip>
        </p>
      </VStack>
    </UserWrap>
  );
}

const AvatarWrap = styled.div`
  overflow: hidden;
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  border-radius: 50%;
  border: 4px solid #141225;
  background: #bcbccc;
  box-sizing: border-box;
  @media screen and (min-width: 744px) {
    margin: 0 30px 0 0;
  }
  @media screen and (min-width: 744px) {
    width: 150px;
    height: 150px;
  }
`;

const UserWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 34px 0 38px;

  strong {
    display: block;
    font-weight: 600;
    font-size: 30px;
  }

  p {
    display: block;
    margin-top: 2px !important;
    font-weight: 400;
    font-size: 18px;

    span {
      display: inline-block;
      font-weight: 300;
      margin: -4px 0 0 5px;
      vertical-align: middle;
      transform: scaleX(1.2);
    }
  }

  @media screen and (min-width: 744px) {
    flex-direction: row;
    padding: 60px 0 40px 0;

    .chakra-stack {
      align-items: flex-start;
    }

    p {
      font-size: 17px;
    }
  }
`;
