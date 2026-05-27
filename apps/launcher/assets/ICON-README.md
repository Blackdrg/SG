# SpiceGarden Launcher - Icons needed for Windows packaging

## Required Icons
- `icon.ico` - Windows application icon (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)

## Generating Icons

1. **Online ICO Generator**: Use https://icoconvert.com/ to convert PNG to ICO
2. **Command-line**: Install ImageMagick and run:
   ```powershell
   magick convert icon.png -resize 256x256 icon.ico
   ```
3. **Placeholder generation**: Run the icon generator script

## Icon Design Specifications
- Primary Color: #10b981 (SpiceGarden Green)
- Background: Dark gradient (#0f172a to #1e293b)
- Text: "SG" in white for branding