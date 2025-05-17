# TaskFlow Deployment Guide for Render.com

This guide provides step-by-step instructions for deploying the TaskFlow application to Render.com's free tier.

## Prerequisites

- A GitHub account with your project repository
- A Render.com account (sign up at https://render.com)

## Deployment Steps

### 1. Push your code to GitHub

Make sure your code is in a GitHub repository. If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Set up a PostgreSQL database on Render

1. Log in to your Render dashboard
2. Click "New +" and select "PostgreSQL"
3. Fill in the following details:
   - Name: `taskflow-db` (or your preferred name)
   - Database: `taskflow`
   - User: `taskflow_user`
   - Region: Choose the closest to your location
   - Plan: Free
4. Click "Create Database"
5. Once created, note the "Internal Database URL" - you'll need this later

### 3. Deploy your web service using the Blueprint

Render Blueprints allow you to deploy your entire infrastructure defined in `render.yaml`.

1. In your Render dashboard, click "New +" and select "Blueprint"
2. Connect to your GitHub repository
3. Render will detect the `render.yaml` file and show you the resources it will create
4. Click "Apply" to create the resources

Note: The deployment uses a custom build script (`build.sh`) that handles the build process. This script ensures that all the necessary build tools are available during deployment.

### 4. Alternative: Manual Web Service Setup

If you prefer to set up manually instead of using the Blueprint:

1. In your Render dashboard, click "New +" and select "Web Service"
2. Connect to your GitHub repository
3. Fill in the following details:
   - Name: `taskflow-app` (or your preferred name)
   - Environment: Node
   - Region: Choose the closest to your location
   - Branch: main (or your default branch)
   - Build Command: `./build.sh`
   - Start Command: `npm start`
   - Plan: Free
4. Under "Advanced" settings, add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: (paste the Internal Database URL from step 2)
5. Click "Create Web Service"

### 5. Verify Deployment

1. Once deployment is complete, Render will provide a URL for your application (e.g., `https://taskflow-app.onrender.com`)
2. Visit the URL to verify that your application is running correctly
3. Check the health endpoint at `/api/health` to verify the backend is working

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Check that the `DATABASE_URL` environment variable is set correctly
2. Verify that the database is running in the Render dashboard
3. Check the logs in the Render dashboard for any error messages

### Application Not Loading

If the application doesn't load:

1. Check the build logs in the Render dashboard for any errors
2. Verify that the build command completed successfully
3. Check that the start command is correct

### Slow Initial Load

The free tier of Render spins down services after periods of inactivity:

- The first request after inactivity may take 30-60 seconds to respond
- This is normal behavior for the free tier
- Subsequent requests will be fast until the service becomes inactive again

## Maintaining Your Deployment

### Updating Your Application

When you push changes to your GitHub repository, Render will automatically rebuild and redeploy your application.

### Monitoring

1. Use the Render dashboard to monitor your application's status
2. Check the logs for any errors or issues
3. Set up alerts in the Render dashboard for important events

### Database Backups

Render automatically creates daily backups of your PostgreSQL database. To restore a backup:

1. Go to your database in the Render dashboard
2. Click on "Backups"
3. Select the backup you want to restore
4. Click "Restore"

## Free Tier Limitations

Be aware of the following limitations on Render's free tier:

- Web services spin down after 15 minutes of inactivity
- The first request after inactivity may take 30-60 seconds
- Free PostgreSQL databases have a 90-day trial period
- Free tier has limited bandwidth and compute resources

For production use, consider upgrading to a paid plan.
