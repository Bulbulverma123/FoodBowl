# TODO: Update Image Paths for Frontend Public Folder

## Overview
The public folder has been moved from the backend to the frontend. All image paths need to be updated from `/src/public/` to `/` to ensure images display correctly on the deployed frontend.

## Files to Update
- [x] Frontend/src/Components/Nav.jsx: Update logo image path from `/src/public/logoburger.png` to `/logoburger.png`
- [x] Frontend/src/Components/Footer.jsx: Update Google Play and App Store image paths from `/src/public/gogll.png` and `/src/public/new.png` to `/gogll.png` and `/new.png`
- [x] Frontend/src/Components/Carousal.jsx: Update carousel image paths from `/src/public/1.jpg`, `/src/public/2.jpg`, `/src/public/3.jpg`, `/src/public/4.jpg` to `/1.jpg`, `/2.jpg`, `/3.jpg`, `/4.jpg`
- [x] Frontend/src/Components/Developer.jsx: Update developer image path from `/src/public/gourav.jpg` to `/gourav.jpg`

## Next Steps
- Test the application to ensure all images load correctly after the updates.
- Verify the changes in the deployed version.
