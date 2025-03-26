# CapCut Tool - Electron App

A tool for creating CapCut templates with proper file path handling using Electron.

## Setup Instructions

1. Install Node.js and npm from [nodejs.org](https://nodejs.org/)

2. Open a command prompt in the project directory and install dependencies:
   ```
   npm install
   ```

3. Start the application:
   ```
   npm start
   ```

## Features

- Properly handles local file paths for Windows and Mac
- Uses Electron's native file dialog for selecting files
- Generates CapCut-compatible templates with correct file paths
- Preserves original file paths in the exported template

## Usage

1. Click "Browse Files" to select images or videos
2. Adjust duration, effects, and transitions as needed
3. Click "Export to CapCut" to generate a compatible file
4. Import the generated file in CapCut

## Troubleshooting

If you encounter file path issues:
1. Make sure you're running the Electron version, not opening index.html directly
2. Check the file paths in the input fields and adjust if needed
3. For Windows, paths should use double backslashes (\\\\)

## Developer Notes

- Modify main.js for Electron process changes
- Modify preload.js to expose additional APIs to the renderer
- scripts.js contains the main application logic 