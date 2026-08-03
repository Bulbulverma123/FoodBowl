import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalItems: 0,
    totalAmount: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const { item, shopId, shopName } = action.payload;
      const existingItem = state.items.find(
        cartItem => cartItem.itemId === item._id && cartItem.shopId === shopId
      );

      if (existingItem) {
        existingItem.quantity += item.quantity || 1; // Agar item.quantity hai to use karein, warna 1
      } else {
        state.items.push({
          itemId: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          foodType: item.foodType,
          category: item.category,
          quantity: item.quantity || 1, // Agar item.quantity hai to use karein, warna 1
          shopId: shopId,
          shopName: shopName,
          selectedSize: item.selectedSize, // selectedSize ko bhi store karein agar available hai
        });
      }
      // Update totals
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    removeFromCart: (state, action) => {
      const { itemId, shopId } = action.payload;
      state.items = state.items.filter(
        item => !(item.itemId === itemId && item.shopId === shopId)
      );
      
      // Update totals
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    updateQuantity: (state, action) => {
      const { itemId, shopId, quantity } = action.payload;
      const item = state.items.find(
        cartItem => cartItem.itemId === itemId && cartItem.shopId === shopId
      );
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            cartItem => !(cartItem.itemId === itemId && cartItem.shopId === shopId)
          );
        } else {
          item.quantity = quantity;
        }
      }
      
      // Update totals
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    },
    
    clearCartByShop: (state, action) => {
      const { shopId } = action.payload;
      state.items = state.items.filter(item => item.shopId !== shopId);
      
      // Update totals
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, clearCartByShop } = cartSlice.actions;
export default cartSlice.reducer;
