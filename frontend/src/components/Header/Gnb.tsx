import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
interface GnbProps {
  onClose?: any;
}

export default function Gnb({ onClose }: GnbProps) {
  return (
    <GnbWrap>
      <ul className="lst-gnb">
        <li>
          <Link to="/explore" onClick={onClose}>
            <span className="material-symbols-outlined fill">explore</span> Explore
          </Link>
        </li>
        <li>
          <Link to="/my" onClick={onClose}>
            <span className="material-symbols-outlined fill">account_circle</span> Account
          </Link>
        </li>
        <li>
          <Link to="/assets/create" onClick={onClose}>
            <span className="material-symbols-outlined fill">account_balance_wallet</span> My Wallet
          </Link>
        </li>
      </ul>
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

      &::after {
        content: "";
        position: absolute;
        top: 50%;
        right: 13px;
        width: 24px;
        height: 24px;
        margin: 0;
        background: url(/images/icon/expand_more.svg) no-repeat 0 0 / contain;
        transform: translateY(-50%);
        color: #fff;
      }
      span {
        margin-right: 15px;
        font-size: 25px;
      }
    }
  }

  /* @media screen and (min-width: 744px) {
    margin-right: 20px;
    .lst-gnb {
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
