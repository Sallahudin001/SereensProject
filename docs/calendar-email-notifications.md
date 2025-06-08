# Calendar Email Notifications Implementation

## Overview
The calendar system now includes comprehensive email notification functionality using the existing nodemailer infrastructure.

## Features Implemented

### 📧 Customer Email Notifications
- **Trigger**: Automatically sent when a rep schedules an appointment with a customer
- **Recipient**: Customer's email address
- **Content**: Professional appointment confirmation with details
- **Tracking**: `customer_email_sent_at` field in appointments table

### 🔔 Rep Email Notifications  
- **Trigger**: Sent when reminders are due or overdue
- **Recipient**: Rep's email address (from Clerk user data)
- **Content**: Urgent reminder notification with customer context
- **Tracking**: `email_sent_at` field in reminders table

## Technical Implementation

### Database Changes
```sql
-- Added to reminders table
ALTER TABLE reminders ADD COLUMN email_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE reminders ADD COLUMN email_notification_enabled BOOLEAN DEFAULT true;

-- Added to appointments table  
ALTER TABLE appointments ADD COLUMN customer_email_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE appointments ADD COLUMN email_notification_enabled BOOLEAN DEFAULT true;
```

### New Files Created
1. **`lib/calendar-email-service.ts`** - Core email functionality
2. **`app/api/calendar/reminders/send-notifications/route.ts`** - Manual trigger endpoint
3. **`app/api/cron/reminder-notifications/route.ts`** - Automated cron endpoint
4. **`migrations/04_add_email_tracking_fields.sql`** - Database migration
5. **`scripts/test-calendar-emails.js`** - Testing utilities

### Modified Files
- **`app/api/calendar/appointments/route.ts`** - Added customer email notifications

## Email Templates

### Customer Appointment Notification
- Professional branded design
- Appointment details (date, time, type, location)
- Rep contact information
- Responsive HTML template

### Rep Reminder Notification
- Urgency-based color coding (overdue = red, due soon = orange)
- Customer context when available
- Direct link to calendar dashboard
- Priority indicators

## API Endpoints

### Manual Trigger (Admin Only)
```
POST /api/calendar/reminders/send-notifications
GET /api/calendar/reminders/send-notifications (statistics)
```

### Automated Cron Job
```
POST /api/cron/reminder-notifications
GET /api/cron/reminder-notifications (health check)
```

## Configuration

### Environment Variables
- Uses existing email configuration (SMTP or Resend)
- Optional: `CRON_SECRET` for securing cron endpoints

### Email Service Detection
The system automatically detects and uses:
1. **Resend** (if `RESEND_API_KEY` is set)
2. **SMTP** (if SMTP credentials are configured)

## Automation Options

### Option 1: Vercel Cron (Recommended)
Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/reminder-notifications",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### Option 2: External Cron Service
Set up a service to call:
```bash
curl -X POST "https://yourdomain.com/api/cron/reminder-notifications" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Option 3: GitHub Actions
Create `.github/workflows/reminder-notifications.yml`:
```yaml
name: Reminder Notifications
on:
  schedule:
    - cron: "*/15 * * * *"
jobs:
  send-notifications:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger notifications
        run: |
          curl -X POST "${{ secrets.DOMAIN }}/api/cron/reminder-notifications" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Business Logic

### Customer Email Notifications
- ✅ Sent immediately when appointment is created with customer
- ✅ Professional template with appointment details
- ✅ Includes rep contact information
- ✅ Branded with company styling

### Rep Email Notifications
- ✅ Sent for reminders due within 15 minutes
- ✅ Sent for overdue reminders
- ✅ Rate-limited to prevent spam (max 1 email per hour per reminder)
- ✅ Includes customer context when available
- ✅ Priority-based urgency indicators

## Testing

### Run Tests
```bash
node scripts/test-calendar-emails.js
```

### Manual Testing
1. Create an appointment with a customer
2. Create a reminder due soon
3. Check email delivery
4. Verify database tracking fields

## Monitoring

### Email Statistics
```bash
GET /api/calendar/reminders/send-notifications
```

Returns:
- Total reminders vs emails sent
- Overdue pending reminders
- Appointment email statistics

### Log Monitoring
- Successful sends: `📧 Email sent for reminder X to email@domain.com`
- Failures: `❌ Failed to send email for reminder X: Error message`
- Processing: `🔔 Processing due reminders for email notifications...`

## Security Features
- RBAC-based access control
- Cron endpoint protection with bearer token
- Email validation and sanitization
- Error handling without data exposure

## Performance Considerations
- Batch processing of multiple reminders
- Database indexes on email tracking fields
- Rate limiting to prevent email spam
- Graceful failure handling

## Future Enhancements
- Email templates customization
- SMS notifications integration
- Email preferences per user
- Advanced scheduling options
- Email analytics and tracking

---

## Quick Start Guide

1. **Verify Configuration**: Email service (SMTP/Resend) configured
2. **Run Migration**: Email tracking fields added
3. **Test Functionality**: Create appointment with customer
4. **Setup Automation**: Configure cron job for reminders
5. **Monitor**: Check logs and statistics endpoints

The system is now ready for production use with comprehensive email notification capabilities! 