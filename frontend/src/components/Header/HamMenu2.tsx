import { Box } from "@chakra-ui/react";
import React from "react";
import styled from "styled-components";
import ConnectButton from "../ConnectButton";
import Gnb from "./Gnb";
import GnbAccountPrev from "./GnbAccountPrev";

export default function HamMenu2() {
  // 참 왜 오류가 날까요~?? 어렵습니다.
  // 메뉴가 열렸을 때 Header에 배경색이 들어가야 하고 html 스크롤 없어져야 합니다.
  // menu open: sticky 추가 / menu close: sticky 삭제
  // menu open : <html> fixed 추가

  // const headerEl = document.querySelector("#header");
  // const menuEl = document.getElementById("menu");
  // const menuIsChecked = menuEl.checked;

  // headerEl.addEventListener("click", () => {
  //   if (menuEl.menuIsChecked == "true") {
  //     headerEl.classList.add("sticky");
  //     playScroll();
  //   } else {
  //     headerEl.classList.remove("sticky");
  //     stopScroll();
  //   }
  // });

  // function playScroll() {
  //   document.documentElement.classList.remove("fixed");
  // }
  // function stopScroll() {
  //   document.documentElement.classList.add("fixed");
  // }

  return (
    <>
      <InputHam type="checkbox" id="menu" />
      <LabelHam htmlFor="menu">
        <span className="material-symbols-outlined ico-ham">menu</span>
        <span className="material-symbols-outlined ico-close">close</span>
      </LabelHam>
      <DrawerWrap className="drawer">
        <DrawerOverlay className="drawer-overlay" />
        <DrawerContent className="drawer-content open">
          <Gnb />
          <GnbAccountPrev />
          <Box w="calc(100% - 40px)" h="58px" mx="auto" mt="auto" mb="30px">
            <ConnectButton />
          </Box>
        </DrawerContent>
      </DrawerWrap>
    </>
  );
}
const InputHam = styled.input`
  position: absolute;
  width: 0;
  height: 0;
  line-height: 0;
  font-size: 0;
  visibility: hidden;
  &:checked {
    & + label {
      .ico-close {
        display: block;
      }
      .ico-ham {
        display: none;
      }
    }
    & ~ .drawer {
      visibility: visible;
      .drawer-overlay {
        display: block;
      }
      .drawer-content {
        transform: translateX(0);
      }
    }
  }
`;
const LabelHam = styled.label`
  cursor: pointer;
  span {
    font-size: 36px;
  }
  .ico-close {
    display: none;
  }
`;
const DrawerWrap = styled.div`
  overflow: hidden;
  visibility: hidden;
  position: fixed;
  top: 72px;
  right: 0;
  width: 100%;
  height: calc(100vh - 70px);
`;
const DrawerOverlay = styled.div`
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  background: rgba(0, 0, 0, 0.7);
  width: 100%;
  height: 100%;
`;
const DrawerContent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 428px;
  height: 100%;
  background: #3d3755;
  transform: translateX(100%);
  transition: 0.3s;
  /* &.open {
    transform: translateX(0);
  } */
`;
