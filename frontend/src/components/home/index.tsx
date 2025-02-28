import React from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Box, Button, Heading, Image, Stack, Text } from "@chakra-ui/react";
import "@kfonts/nanum-square-ac";

export default function SlickIntro() {
  const navigate = useNavigate();
  const settings = {
    arrows: true,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          arrows: false,
        },
      },
    ],
  };
  return (
    <>
      <SliderWrap {...settings}>
        {/*<Stack className="slide-item" justifyContent="center">*/}
        {/*  <Box className="txt-wrap" w="90%" margin="0 auto">*/}
        {/*    <Heading>Finple NFT</Heading>*/}
        {/*    <Text fontFamily="nanum-square-ac">*/}
        {/*      실물자산 기반 <br /> 최초의 수익형 부동산 NFT*/}
        {/*    </Text>*/}
        {/*    <ButtonGroup className="btn-wrap">*/}
        {/*      <Button*/}
        {/*        size={{ base: "lg", lg: "md" }}*/}
        {/*        maxW={157}*/}
        {/*        onClick={() => navigate("/explore")}*/}
        {/*      >*/}
        {/*        <span className="material-symbols-outlined">arrow_right_alt</span> Explore*/}
        {/*      </Button>*/}
        {/*      /!* <Button size={{ base: "lg", md: "md" }} variant="outline">*/}
        {/*          Button*/}
        {/*        </Button> *!/*/}
        {/*    </ButtonGroup>*/}
        {/*  </Box>*/}
        {/*  <Box className="img-wrap">*/}
        {/*    <Image src="/images/main/slide1.png" alt="" />*/}
        {/*  </Box>*/}
        {/*</Stack>*/}
        <Stack className="slide-item" justifyContent="center">
          <Box className="txt-wrap" w="90%" margin="0 auto">
            <Heading>
              FM WAY - <br /> US STOCK
            </Heading>
            <Text fontFamily="nanum-square-ac">FM way 미국주식 펀드 수익율 60% 기념 NFT</Text>
            <Button variant="primary" minW="162px" onClick={() => navigate("/explore")}>
              Explore
            </Button>
          </Box>
          <Box className="img-wrap">
            <Image src="/images/main/slide2.png" alt="" />
          </Box>
        </Stack>
        <Stack className="slide-item" justifyContent="center">
          <Box className="txt-wrap" w="90%" margin="0 auto">
            <Heading>
              FM WAY - <br /> US STOCK
            </Heading>
            <Text fontFamily="nanum-square-ac">FM way 미국주식 펀드 수익율 60% 기념 NFT</Text>
            <Button variant="primary" minW="162px" onClick={() => navigate("/explore")}>
              Explore
            </Button>
          </Box>
          <Box className="img-wrap">
            <Image src="/images/main/slide2.png" alt="" />
          </Box>
        </Stack>
        <Stack className="slide-item" justifyContent="center">
          <Box className="txt-wrap" w="90%" margin="0 auto">
            <Heading>
              FM WAY - <br /> US STOCK
            </Heading>
            <Text fontFamily="nanum-square-ac">FM way 미국주식 펀드 수익율 60% 기념 NFT</Text>
            <Button variant="primary" minW="162px" onClick={() => navigate("/explore")}>
              Explore
            </Button>
          </Box>
          <Box className="img-wrap">
            <Image src="/images/main/slide2.png" alt="" />
          </Box>
        </Stack>
      </SliderWrap>
    </>
  );
}

const SliderWrap = styled(Slider)`
  overflow: hidden;
  position: relative;
  margin: 0 -18px;
  padding: 70px 18px 75px;
  background: #2c273f;
  .slick-track {
    display: flex;
  }
  .slide-item {
    max-width: 1315px;
  }

  .slick-list {
    text-align: center;

    h2 {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 104px;
      margin: 0 auto;
      font-size: 40px;
      font-weight: 600;
      line-height: 1.2;
    }

    p {
      width: 80%;
      margin: 18px auto 40px;
      font-weight: 400;
      font-size: 22px;
      line-height: 32px;
      font-family: "nanum-square-ac";
    }

    .img-wrap {
      overflow: hidden;
      height: 100%;
      margin: 50px auto 0;
      border-radius: 20px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 50% 50%;
      }
    }
  }

  .slick-dots {
    bottom: 50px;
  }

  .btn-wrap {
    display: flex;
    justify-content: center;
    margin: 0 auto;
    padding: 0;

    > button {
      width: auto;
      min-width: 0;
      /* height: 60px; */
      margin: 0 6px;
      padding: 0 30px;

      span {
        margin-right: 10px;
      }
    }
  }

  /* .slick-slide {
    height: 678px;
  } */

  @media screen and (min-width: 744px) {
    padding-top: 75px;
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 95px;
    .slick-list {
      h2 {
        height: auto;
        font-size: 50px;
        font-weight: 700;
      }
      p {
        width: 100%;
        height: auto;
        margin-bottom: 48px;
        font-size: 22px;
        line-height: 32px;
      }
      .img-wrap {
        margin-top: 60px;
      }
    }
    .slide-item {
      max-width: 544px;
      margin: 0 auto;
    }
    .slick-arrow {
      top: 50%;
      transform: translateY(-50%);
      &.slick-prev {
        left: 10px;
        background: url(/images/icon/arrow_back.svg) no-repeat 50% 50% / auto 44px;
      }
      &.slick-next {
        right: 10px;
        background: url(/images/icon/arrow_forward.svg) no-repeat 50% 50% / auto 44px;
      }
    }
  }
  @media screen and (min-width: 1024px) {
    padding-left: 5%;
    padding-right: 5%;
    max-width: none;
    padding-top: 63px;
    padding-bottom: 80px;
    box-sizing: border-box;
    .slick-list,
    .slick-slide {
      height: 377px;
    }

    .slide-item {
      overflow: hidden;
      display: flex !important;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      max-width: none;
      height: 377px;
      margin: 0 auto;
      width: 90% !important;

      .txt-wrap {
        float: left;
        width: 46%;
        margin: 0;
        text-align: left;
      }

      h2 {
        justify-content: flex-start;
      }

      p {
        margin-top: 5px;
        margin-bottom: 55px;
        font-size: 18px;
      }

      .img-wrap {
        float: right;
        width: 380px;
        height: 380px;
        margin: 0;
      }
    }

    .btn-wrap {
      justify-content: flex-start;
      margin: 0;

      > button {
        width: 128px;
        height: 48px;
        margin: 0 12px 0 0;
        padding: 0 22px;
      }
    }
  }
  /* @media screen and (min-width: 1280px) {
    .slick-list {
      height: 480px;

      h2 {
        font-size: 62px;
        font-weight: 600;
      }

      p {
        margin-top: 20px;
        margin-bottom: 45px;
        font-size: 20px;
        font-weight: 400;
      }
    }

    .slide-item {
      max-width: 1320px;
      width: 100% !important;
      height: 480px;

      .slick-arrow {
        width: 480px;
        height: 480px;
      }

      .img-wrap {
        width: 480px;
        height: 480px;

        img {
          width: 480px;
          height: 480px;
        }
      }
    }

    .btn-wrap {
      > button {
        width: 154px;
      }
    }

    .slick-slide {
      height: 519px;
    }
  } */
  /* @media screen and (min-width: 1920px) {
    .slick-list {
      h2 {
        font-size: 62px;
      }
    }

    .slide-item img {
      width: 41%;
    }

    .btn-wrap {
      > button {
        width: 154px;
      }
    }
  } */
`;
