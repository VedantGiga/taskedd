#!/usr/bin/env node

/**
 * This script helps prepare your application for deployment
 * It checks for required environment variables and builds the application
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}=== TaskFlow Deployment Helper ===${colors.reset}\n`);

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const hasEnvFile = fs.existsSync(envPath);

if (!hasEnvFile) {
  console.log(`${colors.yellow}No .env file found. Creating one...${colors.reset}`);

  rl.question(`${colors.blue}Do you have a DATABASE_URL? (y/n): ${colors.reset}`, (answer) => {
    if (answer.toLowerCase() === 'y') {
      rl.question(`${colors.blue}Enter your DATABASE_URL: ${colors.reset}`, (dbUrl) => {
        fs.writeFileSync(envPath, `DATABASE_URL=${dbUrl}\n`);
        console.log(`${colors.green}.env file created with DATABASE_URL${colors.reset}`);
        continueDeployment();
      });
    } else {
      console.log(`${colors.yellow}You'll need to set up a database before deployment.${colors.reset}`);
      console.log(`${colors.yellow}See DEPLOYMENT.md for instructions on setting up a free database.${colors.reset}`);
      continueDeployment();
    }
  });
} else {
  console.log(`${colors.green}.env file found${colors.reset}`);
  continueDeployment();
}

function continueDeployment() {
  console.log(`\n${colors.cyan}Checking for Render deployment configuration...${colors.reset}`);

  // Check for render.yaml
  const renderYamlPath = path.join(process.cwd(), 'render.yaml');
  const hasRenderYaml = fs.existsSync(renderYamlPath);

  if (hasRenderYaml) {
    console.log(`${colors.green}✓ render.yaml found${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ render.yaml not found${colors.reset}`);
    console.log(`${colors.yellow}  See RENDER_DEPLOYMENT.md for instructions on deploying to Render.com${colors.reset}`);
  }

  // Check for Procfile
  const procfilePath = path.join(process.cwd(), 'Procfile');
  const hasProcfile = fs.existsSync(procfilePath);

  if (hasProcfile) {
    console.log(`${colors.green}✓ Procfile found${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Procfile not found${colors.reset}`);
    console.log(`${colors.yellow}  Creating Procfile for Render deployment...${colors.reset}`);
    fs.writeFileSync(procfilePath, 'web: npm start\n');
    console.log(`${colors.green}✓ Procfile created${colors.reset}`);
  }

  console.log(`\n${colors.cyan}Building application...${colors.reset}`);

  try {
    // Run the build command
    execSync('npm run build', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Build successful${colors.reset}`);

    console.log(`\n${colors.cyan}Deployment preparation complete!${colors.reset}`);
    console.log(`${colors.cyan}Follow the instructions in RENDER_DEPLOYMENT.md to deploy your application to Render.com${colors.reset}`);
    console.log(`${colors.cyan}Your application is now ready to be deployed to Render.com!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Build failed${colors.reset}`);
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }

  rl.close();
}
