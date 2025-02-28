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

export const Layout2: React.FC<Props> = () => {
  const [prevLocation, setPrevLocation] = useState<any>();
  const location = useLocation();
  useEffect(() => {
    if (prevLocation !== location.pathname) {
      window.scrollTo(0, 0);
      setPrevLocation(location.pathname);
    }
  }, [location, prevLocation]);
  return (
    <Wrap id="asset-detail">
      <Box className="wrap-inner">
        <Header />
        <Main>
          <Container size={["sm", "sm", "sm", "md", "lg", "xl", "xxl"]}>
            <Outlet />
          </Container>
        </Main>
        <Footer />
      </Box>
    </Wrap>
  );
};

const Main = styled.main`
  display: flex;
  min-height: calc(100vh - 250px);
  padding: 0 0 83px;
  @media screen and (min-width: 744px) {
    min-height: calc(100vh - 220px);
    padding: 0 0 100px;
  }
  @media screen and (min-width: 1024px) {
    min-height: calc(100vh - 70px);
    /* padding-top: 88px; */
  }
`;

const Wrap = styled.div`
  &#intro {
    background: #0e0c2e;
    .wrap-inner {
      background: url(/images/bg/main_428_bottom.jpg) no-repeat 0 100%,
        url(/images/bg/main_428_top.jpg) no-repeat 0 0;
      background-size: 100% auto;
    }
  }
  &#login {
    background: url(/images/bg/login_428.jpg) no-repeat 100% 0;
    background-size: 100% auto;
  }
  &#explore {
    background: url(/images/bg/explore_428.jpg) no-repeat 50% 0;
    background-size: 100% auto;
  }

  @media screen and (min-width: 744px) {
    &#intro {
      .wrap-inner {
        background: url(/images/bg/main_744_bottom.jpg) no-repeat 0 100%,
          url(/images/bg/main_744_top.jpg) no-repeat 0 0;
        background-size: 100% auto;
      }
    }
    &#login {
      background-image: url(/images/bg/login_744.jpg);
    }
    &#explore {
      background-image: url(/images/bg/explore_744.jpg);
    }
  }
  @media screen and (min-width: 1024px) {
    &#intro {
      .wrap-inner {
        background: url(/images/bg/main_1024_bottom.jpg) no-repeat 0 100%,
          url(/images/bg/main_1024_top.jpg) no-repeat 0 0;
        background-size: 100% auto;
      }
    }
    &#login {
      background-image: url(/images/bg/login_1024.jpg);
    }
    &#explore {
      background-image: url(/images/bg/explore_1024.jpg);
    }
  }
  @media screen and (min-width: 1280px) {
    &#intro {
      .wrap-inner {
        background: url(/images/bg/main_1920_bottom.jpg) no-repeat 0 100%,
          url(/images/bg/main_1920_top.jpg) no-repeat 0 0;
        background-size: 100% auto;
      }
    }
    &#login {
      background-image: url(/images/bg/login_1920.jpg);
      background-position: 50% 50%;
    }
    &#explore {
      background-image: url(/images/bg/explore_1920.jpg);
      background-position: 50% 0;
    }
  }
`;
