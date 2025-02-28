import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { useSelector } from "react-redux";

export interface CartItem {
  asset: any;
  orderData: any;
}
export interface CartState {
  lists: CartItem[];
}

const initialState: CartState = {
  lists: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addCart: (state, action: PayloadAction<CartItem>) => {
      const idx = state.lists.findIndex((v) => v.orderData.id === action.payload.orderData.id);
      if (idx === -1) {
        state.lists.push(action.payload);
      }
    },
    removeCart: (state, action: PayloadAction<string>) => {
      const idx = state.lists.findIndex((v) => v.orderData.id === action.payload);
      if (idx > -1) {
        state.lists.splice(idx, 1);
      }
    },
    clearCart: (state) => {
      state.lists = [];
    },
  },
});

export const { addCart, removeCart, clearCart } = cartSlice.actions;

export const useCartList = () => {
  return useSelector((state: RootState) => state.cart.lists);
};
export const useCartCount = () => {
  return useSelector((state: RootState) => state.cart.lists.length);
};

export const isIncludeCart = (cart: CartState, id: string): boolean => {
  if (id) {
    const is = cart.lists?.findIndex((v) => v.orderData.id === id);
    return is > -1 ? true : false;
  }
  return false;
};

export default cartSlice.reducer;
