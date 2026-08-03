# Google Authentication Setup Guide

## 🔧 **Issues Fixed:**

### 1. **Firebase Configuration**
- ✅ Added proper Google Auth Provider configuration
- ✅ Improved error handling for Firebase initialization
- ✅ Added fallback API key for development

### 2. **Error Handling**
- ✅ Added comprehensive error handling for different auth scenarios
- ✅ User-friendly error messages
- ✅ Loading states for better UX

### 3. **Code Improvements**
- ✅ Removed hardcoded server URLs
- ✅ Used environment variables
- ✅ Better error logging and debugging

## 🚀 **Setup Instructions:**

### Step 1: Get Firebase API Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `foodappfoodbowl`
3. Go to Project Settings → General
4. Copy the Web API Key

### Step 2: Create Environment File
Create a `.env` file in the Frontend directory:

```env
# Firebase Configuration
VITE_FIREBASE_APIKEY=your_actual_firebase_api_key_here

# Backend Server URL
VITE_SERVER_URL=http://localhost:8000
```

### Step 3: Enable Google Authentication
1. In Firebase Console, go to Authentication → Sign-in method
2. Enable Google provider
3. Add your domain to authorized domains:
   - `localhost` (for development)
   - Your production domain (when deployed)

### Step 4: Test the Setup
1. Start your backend server:
   ```bash
   cd Backend
   npm run dev
   ```

2. Start your frontend server:
   ```bash
   cd Frontend
   npm run dev
   ```

3. Test Google authentication:
   - Go to `/signin` or `/signup`
   - Click "Sign in/up with Google"
   - Complete the Google OAuth flow

## 🐛 **Common Issues & Solutions:**

### Issue 1: "Firebase API key not found"
**Solution:** Make sure your `.env` file has the correct API key:
```env
VITE_FIREBASE_APIKEY=your_actual_api_key_here
```

### Issue 2: "Popup blocked by browser"
**Solution:** 
- Allow popups for your domain
- Try in incognito mode
- Check browser popup settings

### Issue 3: "Network request failed"
**Solution:**
- Check internet connection
- Verify Firebase project is active
- Check if backend server is running

### Issue 4: "Invalid domain"
**Solution:**
- Add your domain to Firebase authorized domains
- For localhost, make sure `localhost` is in the list

## 🔍 **Debugging Tips:**

### 1. Check Console Logs
Open browser dev tools and look for:
- Firebase initialization errors
- Network request failures
- Authentication errors

### 2. Verify Firebase Configuration
Make sure your Firebase config matches:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "foodappfoodbowl.firebaseapp.com",
  projectId: "foodappfoodbowl",
  // ... other config
};
```

### 3. Test Backend Connection
Check if the backend `/api/auth/google-auth` endpoint is working:
```bash
curl -X POST http://localhost:8000/api/auth/google-auth \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@example.com","role":"user"}'
```

## 📱 **Features Added:**

### ✅ **Enhanced Error Handling**
- Popup closed by user
- Popup blocked by browser
- Network errors
- Backend errors

### ✅ **Loading States**
- Spinner during authentication
- Disabled buttons during loading
- Clear user feedback

### ✅ **Better UX**
- Error messages in UI
- Success notifications
- Proper form validation

## 🧪 **Testing Checklist:**

- [ ] Regular email/password signin works
- [ ] Regular email/password signup works
- [ ] Google signin works
- [ ] Google signup works
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] User gets redirected after successful auth
- [ ] Cart functionality works after auth

## 🔐 **Security Notes:**

1. **Never commit `.env` files** to version control
2. **Use environment variables** for all sensitive data
3. **Validate user input** on both frontend and backend
4. **Use HTTPS** in production
5. **Regularly rotate** API keys

## 📞 **Support:**

If you're still having issues:
1. Check the browser console for errors
2. Verify Firebase project settings
3. Test with a fresh browser session
4. Check network connectivity
5. Verify backend server is running

The Google authentication should now work properly with better error handling and user feedback!
