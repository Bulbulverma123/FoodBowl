# Cart Functionality

## Overview
This cart system allows users to add items from different shops to their cart and manage them in a dedicated cart page.

## Features

### 🛒 **Global Cart State**
- Items are stored in Redux store for persistence across pages
- Cart state includes: items, totalItems, totalAmount
- Items are grouped by shop for better organization

### 🏪 **Shop Integration**
- Items from different shops can be added to cart
- Each shop's items are displayed separately in cart
- Shop information is preserved with each item

### 🎨 **UI Features**
- **Cart Icon Badge**: Shows total item count in navbar
- **Empty Cart State**: Beautiful empty state with call-to-action
- **Item Management**: Add, remove, update quantities
- **Responsive Design**: Works on all screen sizes
- **Success Notifications**: Toast messages when items are added

### 🛍️ **Cart Page Features**
- **Item Display**: Images, names, categories, food types
- **Quantity Controls**: Increase/decrease quantities
- **Price Calculation**: Real-time total updates
- **Order Placement**: Place orders for each shop separately
- **Clear Cart**: Option to clear entire cart

## How to Use

### Adding Items to Cart
1. Navigate to Shop Section
2. Select a shop
3. Click "Add to Cart" on any item
4. See success notification
5. Cart icon shows updated count

### Managing Cart
1. Click cart icon in navbar
2. View all items grouped by shop
3. Adjust quantities using +/- buttons
4. Remove items using trash icon
5. Place orders or clear cart

### Order Placement
1. Ensure you're logged in
2. Review items in cart
3. Click "Place Order"
4. Orders are placed for each shop separately
5. Cart is cleared after successful order

## Technical Implementation

### Redux Store Structure
```javascript
cart: {
  items: [
    {
      itemId: "item_id",
      name: "Item Name",
      price: 100,
      image: "image_url",
      foodType: "veg",
      category: "Main Course",
      quantity: 2,
      shopId: "shop_id",
      shopName: "Shop Name"
    }
  ],
  totalItems: 5,
  totalAmount: 500
}
```

### Key Components
- **Cart Page**: `/src/screens/Cart.jsx`
- **Cart Slice**: `/src/redux/cartSlice.js`
- **Updated ShopSection**: Uses global cart state
- **Updated Navbar**: Shows cart count

### Routes
- `/cart` - Cart page (accessible to all users)

## Styling
- Uses Bootstrap classes for consistent design
- Matches project's green color scheme
- Responsive grid layout
- Card-based design for better organization
