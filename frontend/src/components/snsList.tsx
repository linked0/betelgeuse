import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { Image, VisuallyHidden } from "@chakra-ui/react";

export default function SnsList() {
  return (
    <SnsWrap>
      <Link
        to="#"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "58px",
          height: "58px",
        }}
      >
        <span className="material-symbols-outlined">language</span>
      </Link>
      <Link to="#">
        <Image src="/images/icon/sns_discord.svg" alt="discord" />
        <VisuallyHidden>discord</VisuallyHidden>
      </Link>
      <Link to="#">
        <span className="material-symbols-outlined">
          <Image src="/images/icon/sns_twitter.svg" alt="twitter" />
          <VisuallyHidden>twitter</VisuallyHidden>
        </span>
      </Link>
      <Link to="#">
        <span className="material-symbols-outlined">
          <Image src="/images/icon/sns_media.svg" alt="media" />
          <VisuallyHidden>media</VisuallyHidden>
        </span>
      </Link>
      <Link to="#">
        <span className="material-symbols-outlined">more_vert</span>
      </Link>{" "}
    </SnsWrap>
  );
}

const SnsWrap = styled.div`
  display: inline-flex;
  height: 58px;
  margin-top: 42px;
  border-radius: 8px;
  border: 1px solid #443f5b;
  a {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 58px;
    height: 58px;
    border-right: 1px solid #443f5b;
    span {
      margin: 0;
    }
    &:last-child {
      border: none;
    }
    &:hover {
      background: #443f5b;
      &::after {
        content: "";
        position: absolute;
        top: 0;
        left: -1px;
        right: -1px;
        bottom: 0;
        border: 1px solid #8f8db1;
      }
    }
    &:first-child:hover::after {
      border-radius: 8px 0 0 8px;
    }
    &:last-child:hover::after {
      border-radius: 0 8px 8px 0;
    }
  }
`;
