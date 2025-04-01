# Slack Vocal

A tool to chart message activity of multiple Slack users over time.

## Features

- Track message activity for multiple Slack users (up to 5)
- Generate an HTML chart showing message counts per day
- Display data for the last 90 days
- Colorblind-friendly visualization 
- Automatic user details fetching from Slack

## Setup

1. Install dependencies:
   ```
   pnpm install
   ```

2. Create a `.env` file (see `.env.example`):
   ```
   # Slack API token (Bot token)
   SLACK_TOKEN=xoxb-your-token-here

   # Comma-separated list of Slack user IDs to track (maximum 5 users)
   SLACK_USER_IDS=U12345678,U87654321
   ```

3. Run the application:
   ```
   pnpm start
   ```

## Slack App Setup

1. Go to https://api.slack.com/apps and create a new app
2. Add the following OAuth scopes:
   - channels:history
   - channels:read
   - groups:history
   - groups:read
   - im:history
   - im:read
   - mpim:history
   - mpim:read
   - users:read
3. Install the app to your workspace
4. Copy the Bot User OAuth Token as your `SLACK_TOKEN`
5. Get user IDs from Slack by clicking on user profiles and selecting "Copy member ID"

## Output

The application generates an HTML chart file (`slack-activity.html`) that you can open in any web browser.

### GitHub Pages Deployment

This project can be automatically deployed to GitHub Pages:

1. In your GitHub repository, go to Settings > Pages and set the build source to "GitHub Actions"
2. Add the following secrets in Settings > Secrets and variables > Actions:
   - `SLACK_TOKEN`: Your Slack Bot User OAuth Token
   - `SLACK_USER_IDS`: Comma-separated list of user IDs
3. The GitHub Action workflow will:
   - Run daily at midnight
   - Generate the activity chart
   - Deploy it to GitHub Pages
   - Make it available at `https://[username].github.io/slack-vocal/`

## Technologies

- TypeScript
- date-fns for date handling
- Chart.js for data visualization
- Slack Web API