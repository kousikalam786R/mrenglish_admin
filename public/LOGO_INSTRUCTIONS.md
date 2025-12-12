# Logo Setup Instructions

## Adding Your Logo

1. **Place your logo file** in this `public/` directory
   - Recommended filename: `logo.png` or `logo.svg`
   - The application expects the logo at `/logo.png`

2. **Recommended Logo Specifications:**
   - **Format**: PNG (with transparent background) or SVG (preferred)
   - **Size**: 
     - For Sidebar: 80x80px (will be scaled to 80px height)
     - For Login page: 200x200px (will be scaled to 192px height)
   - **Aspect Ratio**: Square (1:1) works best
   - **Colors**: Should work on both light and dark backgrounds

3. **Current Usage:**
   - **Sidebar**: Logo appears next to "SpeakVerse Admin" text (80px height)
   - **Login Page**: Logo appears above the login form (192px height)

## File Naming

The logo is referenced as `/logo.png` in the code. If you use a different filename or format, you'll need to update:
- `components/Sidebar.tsx` (line ~103)
- `app/login/page.tsx` (line ~88)

## Alternative: Using SVG

If you prefer SVG format, update the Image src in both files:
```tsx
<Image 
  src="/logo.svg" 
  alt="SpeakVerse Logo" 
  width={32} 
  height={32}
  className="h-8 w-8 object-contain"
/>
```

