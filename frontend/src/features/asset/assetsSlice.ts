import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { useSelector } from "react-redux";

export interface AssetsState {
  collectedList: any[];
  createdList: any[];
  updateTime: number;
}

const initialState: AssetsState = {
  collectedList: [],
  createdList: [],
  updateTime: NaN,
};

export const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    changeCollectedList: (state, action: PayloadAction<any>) => {
      state.collectedList = action.payload;
      state.updateTime = new Date().getTime();
    },
    changeCreatedList: (state, action: PayloadAction<any>) => {
      state.createdList = action.payload;
    },
  },
});

export const { changeCollectedList, changeCreatedList } = assetsSlice.actions;

export const useCollectedList = () => {
  return useSelector((state: RootState) => state.assets.collectedList);
};
export const useCollectedCount = () => {
  return useSelector((state: RootState) => state.assets.collectedList.length);
};
export const useCreatedList = () => {
  return useSelector((state: RootState) => state.assets.createdList);
};
export const useCreatedCount = () => {
  return useSelector((state: RootState) => state.assets.createdList.length);
};
export const useUpdateTime = () => {
  return useSelector((state: RootState) => state.assets.updateTime);
};

export default assetsSlice.reducer;
