import React from "react";
import { Box } from "@chakra-ui/react";
import "@kfonts/nanum-square-ac";
import ThumbCollection from "../collection/ThumbCollection";
import { EmptyList, EmptyType } from "../collection/EmptyList";
import styled from "@emotion/styled";
import Slider from "react-slick";

export default function SlickSearch({ collections }: { collections: any[] }) {
  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: collections?.length < 4 ? collections.length : 4,
    slidesToScroll: 1,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: collections?.length < 3 ? collections.length : 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: collections?.length < 2 ? collections.length : 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 744,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          arrows: false,
        },
      },
    ],
  };
  return (
    <Box
      id="AAA"
      mx={[
        "-5px !important",
        "-5px !important",
        "-5px !important",
        "-5px !important",
        "-11px !important",
      ]}
    >
      {collections && collections.length > 0 ? (
        <SliderWrap {...settings} className="slick-search">
          {collections.map((v: any) => {
            return <ThumbCollection key={v.id} collection={v} />;
          })}
        </SliderWrap>
      ) : (
        <EmptyList type={EmptyType.COLLECTION} />
      )}
    </Box>
  );
}

const SliderWrap = styled(Slider)`
  padding-bottom: 45px;
  .slick-slide {
    padding: 0 5px;
  }
  /* .slick-arrow {
    top: 20px;
    &.slick-prev {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: red;
      &::after {
        content: "";
        background: url(/images/main/slide-arrow-prev.svg) 50% 50% no-repeat;
      }
    }
    &.slick-next {
      background: url(/images/main/slide-arrow-next.svg) no-repeat 0 0;
    }
  } */

  @media screen and (min-width: 744px) {
    .slick-slide {
      padding: 0 11px;
    }
  }
`;
