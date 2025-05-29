import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Creating dist directory...');

// Create dist directory if it doesn't exist
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
  console.log('Created dist directory');
} else {
  console.log('Dist directory already exists');
}

// Create a simple index.html file in the dist directory
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Office Bills Management</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(distPath, 'index.html'), htmlContent);
console.log('Created index.html in dist directory');

// Copy public directory if it exists
const publicPath = path.join(__dirname, 'public');
const distPublicPath = path.join(distPath, 'public');

if (fs.existsSync(publicPath)) {
  if (!fs.existsSync(distPublicPath)) {
    fs.mkdirSync(distPublicPath, { recursive: true });
  }
  
  // Copy all files from public to dist/public
  const files = fs.readdirSync(publicPath);
  files.forEach(file => {
    fs.copyFileSync(
      path.join(publicPath, file),
      path.join(distPublicPath, file)
    );
  });
  console.log('Copied public directory to dist/public');
}

console.log('Build completed successfully!');
