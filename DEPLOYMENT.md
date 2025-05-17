# TaskFlow Deployment Guide

This document provides instructions for deploying the TaskFlow application for free using various platforms.

## Option 1: Render.com (Recommended)

Render offers a free tier that works well for full-stack applications.

### Prerequisites
- A GitHub account with your project repository
- A Render.com account (sign up at https://render.com)

### Deployment Steps

1. **Push your code to GitHub**
   - Make sure your code is in a GitHub repository

2. **Create a new Web Service on Render**
   - Go to your Render dashboard
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Choose the branch to deploy (usually `main`)
   - Give your service a name (e.g., "taskflow-app")
   - Set the Runtime to "Node"
   - Set the Build Command to: `npm install && npm run build`
   - Set the Start Command to: `npm start`
   - Select the Free plan
   - Click "Create Web Service"

3. **Set up Environment Variables**
   - In your web service settings, go to the "Environment" tab
   - Add the following environment variables:
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: Your database connection string (see Database section below)

4. **Set up a Database**
   - **Option A: Use Neon Database (Free Tier)**
     - Sign up at https://neon.tech
     - Create a new project
     - Create a new database
     - Get the connection string from the dashboard
     - Add it as the `DATABASE_URL` environment variable in Render

   - **Option B: Use Render PostgreSQL (Free for 90 days)**
     - In your Render dashboard, click "New +" and select "PostgreSQL"
     - Configure your database settings
     - Use the provided connection string as your `DATABASE_URL`

5. **Deploy Your Application**
   - Render will automatically deploy your application when you push changes to your GitHub repository
   - You can also manually trigger deployments from the Render dashboard

6. **Access Your Application**
   - Once deployed, your application will be available at the URL provided by Render (e.g., `https://taskflow-app.onrender.com`)

## Option 2: Vercel + Neon Database

Vercel is excellent for frontend applications, but requires some adaptation for Express backends.

### Prerequisites
- A GitHub account with your project repository
- A Vercel account (sign up at https://vercel.com)
- A Neon Database account (sign up at https://neon.tech)

### Deployment Steps

1. **Create a `vercel.json` file in your project root**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/index.ts",
         "use": "@vercel/node"
       },
       {
         "src": "client/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist/public"
         }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "client/index.html"
       }
     ]
   }
   ```

2. **Set up a Neon Database**
   - Sign up at https://neon.tech
   - Create a new project and database
   - Get the connection string

3. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Configure the build settings
   - Add the `DATABASE_URL` environment variable with your Neon connection string
   - Deploy your application

## Option 3: Railway.app

Railway offers a free tier with $5 of free credits per month.

### Prerequisites
- A GitHub account with your project repository
- A Railway account (sign up at https://railway.app)

### Deployment Steps

1. **Create a new project on Railway**
   - Connect your GitHub repository
   - Railway will automatically detect your Node.js application

2. **Add a PostgreSQL database**
   - Click "New" and select "Database" → "PostgreSQL"
   - Railway will automatically add the database to your project

3. **Configure environment variables**
   - Add the `NODE_ENV` variable set to `production`
   - Railway automatically sets up the `DATABASE_URL` variable

4. **Deploy your application**
   - Railway will automatically deploy your application
   - You can access your application at the provided URL

## Maintaining Your Free Deployment

- **Monitor usage limits**: Free tiers have limitations on usage, uptime, and resources
- **Keep your repository up to date**: Push changes to trigger automatic deployments
- **Set up proper error logging**: Use services like Sentry (free tier available) for monitoring errors
- **Implement database backups**: Regularly back up your database to prevent data loss
