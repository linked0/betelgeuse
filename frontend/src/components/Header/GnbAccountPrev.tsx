import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import GnbAccount from "./GnbAccount";
interface GnbProps {
  onClose?: any;
}

export default function GnbAccountPrev({ onClose }: GnbProps) {
  return (
    <GnbWrap>
      <ul className="lst-gnb">
        <li>
          <Link to="#" onClick={onClose}>
            <span className="material-symbols-outlined" style={{ transform: "rotate(90deg)" }}>
              expand_more
            </span>{" "}
            Account
          </Link>
        </li>
      </ul>
      <GnbAccount />
    </GnbWrap>
  );
}

const GnbWrap = styled.div`
  .lst-gnb {
    li {
      display: flex;
      border-bottom: 1px solid #443f5b;
      padding-left: 10px;
    }

    a,
    button {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      padding: 20px 13px;
      font-weight: 600;
      font-size: 16px;
      line-height: 35px;
      color: var(--chakra-colors-white);

      &:hover {
        color: var(--chakra-colors-boa-2);
        background: transparent;
      }

      span {
        margin-right: 15px;
        font-size: 23px;
      }
    }
  }

  /* @media screen and (min-width: 744px) {
    margin-right: 20px;
    .lst-gnb {
      display: flex;
      list-style: none;
      height: 100%;

      li {
        border-bottom: none;
      }

      a,
      button {
        display: flex;
        align-items: center;
        height: 100%;
        padding: 0 16px;
        border: none;
        font-weight: 600;
        font-size: 18px;

        &::after {
          display: none;
        }
      }
    }
  }
  @media screen and (min-width: 1024px) {
    .lst-gnb {
      a,
      button {
        font-size: 14px;
      }
    }
  } */
`;
