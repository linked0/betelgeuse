import React, { Suspense, useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";

import { useAppApolloClient } from "./api/ApolloClient";
import { CookiesProvider } from "react-cookie";
import { useActiveState } from "./hooks/useActiveState";
import { ACTIVE_STATE } from "./constants";

import Home from "./pages/home";
import My from "./pages/My";
import { theme } from "./theme/index";
import { Layout } from "./components/Layout";
import ConnectWallet from "./pages/connectWallet/ConnectWallet";
import { ModalProvider } from "./hooks/useModal";
import ImportNFT from "./pages/importNFT";
import CreateCollectionPub from "./pages/collection/createCollection";
import CreateAssetPub from "./pages/asset/createAsset";
import AssetDetailPub from "./pages/asset/assetDetail";
import ListForSalePub from "./pages/asset/listForSale";
import SdkSample from "./pages/temp/sdkSample";
import PageNotFound from "./pages/notFound";
import MySettings from "./pages/My/Settings";
import ListCollection from "./pages/collection/listCollection";
import { Layout2 } from "./components/Layout2";
import { SeaportContextProvider } from "./hooks/useSeaport";
import ListCollectionPub from "./pages/collection/listCollectionPub";
import ExploreCollection from "./pages/collection/exploreCollection";
import { useAppDispatch } from "./app/hooks";
import { fetchBOAPrice } from "./features/price/boaPriceSlice";
import Search from "./pages/search";

function App() {
  const client = useAppApolloClient();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const getBoaTimer = setTimeout(() => {
      dispatch(fetchBOAPrice());
    }, 1000 * 60 * 5);
    return () => {
      clearTimeout(getBoaTimer);
    };
  }, [dispatch]);

  const PrivateWrapper = () => {
    const { pathname } = useLocation();
    const { activeState } = useActiveState();
    console.log(" >>> activeState :", activeState);
    return activeState === ACTIVE_STATE.STATUS_ONLINE ? (
      <Outlet />
    ) : (
      <Navigate to="/connect" state={{ before: pathname }} />
    );
  };
  return (
    // lets us use Chakra UI syntax across our app:
    <ChakraProvider theme={theme}>
      <CookiesProvider>
        <ModalProvider>
          <SeaportContextProvider>
            <ApolloProvider client={client}>
              <Suspense fallback={null}>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="home" element={<Home />} />
                      <Route path="explore">
                        <Route index element={<ExploreCollection />} />
                        <Route path=":category" element={<ExploreCollection />} />
                      </Route>
                      <Route path="collection">
                        <Route index element={<ListCollectionPub />} />
                        <Route path=":name" element={<ListCollectionPub />} />
                      </Route>
                      {/* Login 영역 */}
                      <Route element={<PrivateWrapper />}>
                        <Route path="my">
                          <Route index element={<Navigate to="/my/collected" />} />
                          <Route path=":tabName" element={<My />} />
                          <Route path="settings" element={<MySettings />} />
                        </Route>
                        <Route path="importNFT" element={<ImportNFT />} />
                        <Route path="assets">
                          <Route path="create" element={<CreateAssetPub />} />
                          <Route path=":contract/:tokenId/edit" element={<CreateAssetPub />} />
                          <Route path=":contract/:tokenId/sell" element={<ListForSalePub />} />
                        </Route>
                        <Route path="collections">
                          <Route index element={<ListCollection />} />
                          <Route path="create" element={<CreateCollectionPub />} />
                          <Route path="edit/:collectionId" element={<CreateCollectionPub />} />
                        </Route>
                      </Route>

                      <Route path="connect" element={<ConnectWallet />} />
                      <Route path="search">
                        <Route index element={<Search />} />
                        <Route path=":value" element={<Search />} />
                      </Route>
                      {/*<Route path="searchPub" element={<Search />} />*/}

                      <Route path="*" element={<PageNotFound />} />

                      {/*  ---------------- 임시 start --------------------  */}
                      <Route path="sample" element={<SdkSample />} />
                      <Route path="ListForSalePub" element={<ListForSalePub />} />
                      {/*  ---------------- 임시 end --------------------  */}
                    </Route>
                    <Route path="assets" element={<Layout2 />}>
                      <Route path=":contract">
                        <Route index element={<PageNotFound />} />
                        <Route path=":tokenId">
                          <Route index element={<AssetDetailPub />} />
                        </Route>
                      </Route>
                    </Route>
                  </Routes>
                </BrowserRouter>
              </Suspense>
            </ApolloProvider>
          </SeaportContextProvider>
        </ModalProvider>
      </CookiesProvider>
    </ChakraProvider>
  );
}

export default App;
