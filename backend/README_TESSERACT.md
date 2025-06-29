# Tesseract OCR Installation for Food Analysis

The food analysis feature requires Tesseract OCR to extract text from food packaging images. Follow these steps to install it on Windows:

## Option 1: Using Chocolatey (Recommended)

1. Install Chocolatey if you don't have it: https://chocolatey.org/install
2. Open PowerShell as Administrator
3. Run: `choco install tesseract`

## Option 2: Manual Installation

1. Download the Windows installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Choose the latest version (e.g., tesseract-ocr-w64-setup-5.3.1.20230401.exe)
3. Run the installer
4. **Important**: Make sure to check "Add to PATH" during installation
5. Restart your terminal/PowerShell

## Option 3: Using Winget

```powershell
winget install UB-Mannheim.TesseractOCR
```

## Verify Installation

After installation, restart your terminal and run:

```powershell
tesseract --version
```

You should see output like:
```
tesseract 5.3.1
 leptonica-1.82.0
  libgif 5.2.1 : libjpeg 8d (libjpeg-turbo) 2.1.5.1 : libpng 1.6.37 : libtiff 4.5.1 : zlib 1.2.13 : libwebp 1.3.2 : libopenjp2 2.4.0
```

## Testing the Food Analysis

Once Tesseract is installed, the food analysis feature should work properly. If you still get errors, try:

1. Restart your Python backend server
2. Check that the PATH environment variable includes the Tesseract installation directory
3. Verify with: `python -c "import pytesseract; print(pytesseract.get_tesseract_version())"`

## Fallback Behavior

If Tesseract is not installed, the food analysis will still work but will return a generic "Unknown Food Item" instead of extracting specific nutritional information from the image. 