import fs from 'fs';
import path from 'path';

// This script ensures that the theme CSS is properly included in the build
console.log('Ensuring theme CSS is properly included in the build...');

// Path to the built index.html
const indexPath = path.resolve('./dist/public/index.html');

// Check if the file exists
if (!fs.existsSync(indexPath)) {
  console.error('Error: index.html not found at', indexPath);
  process.exit(1);
}

// Read the file
let html = fs.readFileSync(indexPath, 'utf8');

// Check if the theme script is already included
if (html.includes('taskflow-theme')) {
  console.log('Theme script already included in index.html');
} else {
  // Add the theme script to the head
  const themeScript = `
  <script>
    // This script runs before React loads to prevent theme flashing
    (function() {
      try {
        // Try to get the theme from localStorage
        const storedTheme = localStorage.getItem('taskflow-theme');
        
        // Apply the theme immediately
        if (storedTheme === 'dark' || 
            (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      } catch (e) {
        // Fallback if localStorage is not available
        console.error('Theme script error:', e);
      }
    })();
  </script>
  `;
  
  // Insert the script right after the head tag
  html = html.replace('<head>', '<head>\n' + themeScript);
  
  // Write the file back
  fs.writeFileSync(indexPath, html);
  console.log('Theme script added to index.html');
}

// Add inline CSS for the theme
const cssPath = path.resolve('./dist/public/assets');
const cssFiles = fs.readdirSync(cssPath).filter(file => file.endsWith('.css'));

if (cssFiles.length === 0) {
  console.error('Error: No CSS files found in', cssPath);
  process.exit(1);
}

// Add the theme CSS variables directly to the HTML
const themeCSS = `
<style id="theme-vars">
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 240 79.1% 58.8%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 240 79.1% 58.8%;
  --primary-foreground: 210 40% 98%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}

html[data-theme="dark"] {
  color-scheme: dark;
  background-color: #121212;
  color: white;
}

html[data-theme="dark"] body {
  background-color: #121212;
  color: white;
}
</style>
`;

// Insert the CSS right after the head tag
if (!html.includes('id="theme-vars"')) {
  html = html.replace('<head>', '<head>\n' + themeCSS);
  fs.writeFileSync(indexPath, html);
  console.log('Theme CSS variables added to index.html');
} else {
  console.log('Theme CSS variables already included in index.html');
}

console.log('Theme CSS setup complete!');
