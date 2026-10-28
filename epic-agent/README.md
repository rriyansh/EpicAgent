# Epic Agent Hosting Configuration

This project supports deployment on both Vercel and Netlify platforms for easy hosting and CI/CD.

## Supported Platforms

### Vercel

Vercel provides a seamless deployment experience for Node.js applications. The backend runs as a serverless function, while the frontend is deployed as a static site.

#### Deployment Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

4. **Deploy with custom settings**:
   ```bash
   vercel --prod --environment=production
   ```

#### Environment Variables:

Set the following environment variables in Vercel dashboard:

- `JWT_ACCESS_SECRET` - Access token secret (48+ char hex)
- `JWT_REFRESH_SECRET` - Refresh token secret (48+ char hex)
- `ENCRYPTION_KEY` - Encryption key for API keys (64+ char hex)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `FRONTEND_URL` - Frontend URL (http://localhost:5173)
- `OPENAI_API_KEY` - OpenAI API key (optional fallback)

#### Vercel Configuration (`vercel.json`):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/server.ts",
      "use": "@vercel/node",
      "config": { "include": ["backend/src/**/*.ts", "backend/src/**/*.js"] }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/src/server.ts" },
    { "src": "/(.*)", "dest": "/frontend/dist/$1" }
  ],
  "env": {
    "PORT": "4000",
    "NODE_ENV": "production",
    "JWT_ACCESS_SECRET": "@jwt_access_secret",
    "JWT_REFRESH_SECRET": "@jwt_refresh_secret",
    "ENCRYPTION_KEY": "@encryption_key",
    "GOOGLE_CLIENT_ID": "@google_client_id",
    "GOOGLE_CLIENT_SECRET": "@google_client_secret",
    "GOOGLE_REDIRECT_URI": "http://localhost:4000/api/auth/google/callback",
    "FRONTEND_URL": "http://localhost:5173",
    "OPENAI_API_KEY": "@openai_api_key"
  }
}
```

### Netlify

Netlify provides an all-in-one platform for hosting full-stack applications with serverless functions.

#### Deployment Steps:

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm i -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy to Netlify**:
   ```bash
   netlify deploy --prod
   ```

4. **Deploy with custom settings**:
   ```bash
   netlify deploy --prod --site="epic-agent"
   ```

#### Environment Variables:

Set the following environment variables in Netlify dashboard:

- `JWT_ACCESS_SECRET` - Access token secret (48+ char hex)
- `JWT_REFRESH_SECRET` - Refresh token secret (48+ char hex)
- `ENCRYPTION_KEY` - Encryption key for API keys (64+ char hex)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `FRONTEND_URL` - Frontend URL (http://localhost:5173)
- `OPENAI_API_KEY` - OpenAI API key (optional fallback)

#### Netlify Configuration (`netlify.toml`):

```toml
[[redirects]]
  from = "/api/*"
  to = "https://epic-agent-backend.vercel.app/api/$1"
  status = 302
  force = true

[[redirects]]
  from = "/*"
  to = "https://epic-agent-frontend.vercel.app/$1"
  status = 200

[build]
  command = "cd backend && npm run build && cd ../frontend && npm run build"
  publish = "frontend/dist"

[functions]
  directory = "backend/dist"
  node_version = "18"

[env]
  NODE_ENV = "production"
  PORT = "4000"
  JWT_ACCESS_SECRET = "@jwt_access_secret"
  JWT_REFRESH_SECRET = "@jwt_refresh_secret"
  ENCRYPTION_KEY = "@encryption_key"
  GOOGLE_CLIENT_ID = "@google_client_id"
  GOOGLE_CLIENT_SECRET = "@google_client_secret"
  GOOGLE_REDIRECT_URI = "http://localhost:4000/api/auth/google/callback"
  FRONTEND_URL = "http://localhost:5173"
  OPENAI_API_KEY = "@openai_api_key"
```

### CI/CD Pipeline

For automated deployment, set up CI/CD pipelines in your Git hosting platform (GitHub Actions, GitLab CI, etc.).

#### GitHub Actions Example (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        platform: [vercel, netlify]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          backend/package-lock.json
          frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
        cd ../frontend
        npm ci
    
    - name: Build application
      run: |
        cd backend
        npm run build
        cd ../frontend
        npm run build
    
    - name: Deploy to Vercel
      if: matrix.platform == 'vercel'
      run: |
        cd backend
        npx vercel --prod --environment=production
      env:
        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        VERCEL_TEAM_ID: ${{ secrets.VERCEL_TEAM_ID }}
        JWT_ACCESS_SECRET: ${{ secrets.JWT_ACCESS_SECRET }}
        JWT_REFRESH_SECRET: ${{ secrets.JWT_REFRESH_SECRET }}
        ENCRYPTION_KEY: ${{ secrets.ENCRYPTION_KEY }}
        GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
        GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
        FRONTEND_URL: ${{ secrets.FRONTEND_URL }}
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    
    - name: Deploy to Netlify
      if: matrix.platform == 'netlify'
      run: |
        cd backend
        npx netlify deploy --prod --site="epic-agent"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        JWT_ACCESS_SECRET: ${{ secrets.JWT_ACCESS_SECRET }}
        JWT_REFRESH_SECRET: ${{ secrets.JWT_REFRESH_SECRET }}
        ENCRYPTION_KEY: ${{ secrets.ENCRYPTION_KEY }}
        GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
        GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
        FRONTEND_URL: ${{ secrets.FRONTEND_URL }}
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### Local Development

For local development, you can run both platforms locally:

#### Vercel Local:

```bash
cd backend && npm run dev
```

#### Netlify Local:

```bash
cd backend && npm run deploy
```

### Configuration Files

The project includes the following configuration files:

- **`vercel.json`** - Vercel deployment configuration
- **`netlify.toml`** - Netlify deployment configuration
- **`.env.example`** - Example environment variables
- **`.gitignore`** - Files to ignore in version control

### Deployment Checklist

Before deploying, ensure you have:

1. ✅ Generated secure secrets:
    - JWT access/refresh tokens (48+ char hex)
    - Encryption key (64+ char hex)

2. ✅ Configured environment variables in hosting platform

3. ✅ Run build commands:
    ```bash
    cd backend && npm run build
    cd frontend && npm run build
    ```

4. ✅ Tested locally:
    ```bash
    cd backend && npm start
    # Test: curl http://localhost:4000/api/health
    ```

5. ✅ Verified frontend works:
    ```bash
    cd frontend && npm run preview
    # Visit: http://localhost:5173
    ```

### Troubleshooting

#### Vercel Issues

- **Build failures**: Ensure all dependencies are installed and TypeScript builds successfully
- **Environment variables**: Check that all required env vars are set in Vercel dashboard
- **Routing**: Verify that API routes are properly configured in `vercel.json`

#### Netlify Issues

- **Lambda functions**: Ensure backend functions are correctly built
- **Redirects**: Check that redirect rules in `netlify.toml` are correct
- **CORS**: Configure CORS settings in hosting platform if needed

### Monitoring

After deployment, monitor:

- **Application health**: Check `/api/health` endpoint
- **Error logs**: Monitor backend and frontend logs
- **Performance**: Track build times and deployment performance
- **Security**: Review environment variable access and API key security

### Backup and Recovery

For production deployments:

1. **Environment variables**: Document all environment variables and their values
2. **Database backups**: Regularly backup the SQLite database
3. **Configuration files**: Keep copies of deployment configurations
4. **SSL certificates**: Ensure HTTPS is properly configured for production

This configuration provides a complete hosting solution for the Epic Agent platform with easy deployment to both Vercel and Netlify, plus CI/CD pipeline setup for automated deployments.