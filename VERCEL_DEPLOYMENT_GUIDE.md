# 🚀 Vercel Deployment Guide

## Overview
This guide will help you deploy your Next.js application to Vercel with all necessary configurations.

## Prerequisites
- [ ] Git repository (GitHub, GitLab, or Bitbucket)
- [ ] Vercel account
- [ ] Neon database setup
- [ ] Clerk authentication setup

## Required Environment Variables

### Essential Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@hostname:port/database

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### Email Configuration (Choose one method)

#### Method 1: Direct SMTP
```bash
EMAIL_FROM=noreply@yourdomain.com
EMAIL_USER=your-email@smtp-provider.com
EMAIL_PASSWORD=your-smtp-password
EMAIL_RECIPIENT=admin@yourdomain.com
```

#### Method 2: SMTP Server
```bash
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_SECURE=false
```

#### Method 3: Resend API
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### Optional Integrations

#### DocuSign (Optional)
```bash
DOCUSIGN_INTEGRATION_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOCUSIGN_USER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOCUSIGN_ACCOUNT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOCUSIGN_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END RSA PRIVATE KEY-----"
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi
DOCUSIGN_REDIRECT_URI=https://your-domain.vercel.app/api/docusign/callback
```

#### API Security
```bash
MIGRATION_API_KEY=your-secure-migration-key
CRON_SECRET=your-secure-cron-secret
```

## Deployment Steps

### Step 1: Connect Repository to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Choose "Next.js" as the framework preset

### Step 2: Configure Environment Variables
1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add all the required environment variables listed above
3. Set the environment to "Production, Preview, and Development"

### Step 3: Deploy
1. Click "Deploy" - Vercel will automatically build and deploy your app
2. Once deployed, update `NEXT_PUBLIC_BASE_URL` with your actual Vercel URL
3. Redeploy to apply the updated base URL

### Step 4: Configure Custom Domain (Optional)
1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update `NEXT_PUBLIC_BASE_URL` and `DOCUSIGN_REDIRECT_URI` with your custom domain

### Step 5: Database Migration
After deployment, you may need to run database migrations:
1. Use Vercel's function logs to monitor the first deployment
2. Check if any database initialization is needed
3. Use the provided migration scripts if necessary

## Post-Deployment Checklist

### Clerk Configuration
- [ ] Update Clerk dashboard with your Vercel domain
- [ ] Configure allowed origins in Clerk
- [ ] Test authentication flow

### Database
- [ ] Verify database connection
- [ ] Check if migrations ran successfully
- [ ] Test basic CRUD operations

### Email Service
- [ ] Test email sending functionality
- [ ] Verify SMTP/Resend configuration
- [ ] Check email templates render correctly

### Admin Access
- [ ] Run admin setup script: `npm run admin:setup`
- [ ] Verify admin user can access /admin routes
- [ ] Test role-based access control

## Troubleshooting

### Common Issues

#### Build Errors
- Check TypeScript and ESLint errors
- Verify all environment variables are set
- Check Next.js configuration

#### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon database is accessible
- Verify SSL/TLS configuration

#### Authentication Issues
- Check Clerk environment variables
- Verify webhook configuration
- Test sign-in/sign-up flows

#### Email Issues
- Test SMTP credentials
- Check firewall/security settings
- Verify email templates

## Performance Optimization

### Vercel-Specific Optimizations
- Your `next.config.mjs` already includes chunk splitting
- Images are configured as unoptimized
- TypeScript and ESLint errors are ignored during build

### Recommended Settings
- Enable Vercel Analytics
- Configure custom headers if needed
- Set up monitoring and alerts

## Security Considerations

### Environment Variables
- Never commit `.env` files to Git
- Use strong, unique secrets
- Rotate keys regularly

### API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS everywhere

### Database Security
- Use connection pooling
- Enable SSL/TLS
- Implement proper access controls

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Clerk Vercel Integration](https://clerk.com/docs/deployments/deploy-to-vercel)
- [Neon Database Documentation](https://neon.tech/docs)

## Monitoring

After deployment, monitor:
- Application performance
- Database queries
- Email delivery
- Error logs
- User authentication flows 