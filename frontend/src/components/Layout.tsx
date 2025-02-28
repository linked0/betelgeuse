import React, { useEffect, useState } from "react";
import "../assets/scss/comm.scss";
import styled from "styled-components";
import Footer from "./Footer";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import { Box, Container } from "@chakra-ui/react";

interface Props {
  children?: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<Props> = () => {
  const [prevLocation, setPrevLocation] = useState<any>();
  const location = useLocation();
  const [backgroundImage, setBackgroundImage] = useState("");
  useEffect(() => {
    if (location.pathname === "/") {
      setBackgroundImage("intro");
    } else if (location.pathname === "/home") {
      setBackgroundImage("intro");
    } else if (location.pathname === "/explore") {
      setBackgroundImage("explore");
    }
    // else if (location.pathname === "/importNFT") {
    //   setBackgroundImage("login");
    // }
    else {
      setBackgroundImage("");
    }
    if (prevLocation !== location.pathname) {
      window.scrollTo(0, 0);
      setPrevLocation(location.pathname);
    }
  }, [location, prevLocation]);
  return (
    // 배경화면 제어
    // intro 페이지 : <Wrap id="intro">
    // login 페이지 : <Wrap id="login">
    // explore 페이지 : <Wrap id="explore">
    <div id={backgroundImage}>
      <Box className="wrap-inner">
        <Header />
        <Main>
          {/* <Container size={["sm", "sm", "sm", "md", "lg", "xl", "xxl"]}> */}
          <Container>
            <Outlet />
          </Container>
        </Main>
        <Footer />
      </Box>
    </div>
  );
};

const Main = styled.main`
  display: flex;
  position: relative;
  min-height: calc(100vh - 250px);
  padding: 0 0 83px;
  @media screen and (min-width: 744px) {
    min-height: calc(100vh - 220px);
    padding: 0 0 100px;
  }
  @media screen and (min-width: 1024px) {
    min-height: calc(100vh - 189px);
    /* padding-top: 88px; */
  }
`;
