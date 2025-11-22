# Email Configuration for Resend

## Environment Variables to Add

Add these to your `backend/.env` file:

```env
# Email Configuration
EMAIL_FROM=TutorConnect <noreply@tutorconnect.com>
EMAIL_REPLY_TO=support@tutorconnect.com
```

## Email Addresses Guide

### 1. **FROM Address** (`EMAIL_FROM`)
This is the sender address that appears in the email.

**For Testing (without a custom domain):**
```
EMAIL_FROM=TutorConnect <onboarding@resend.dev>
```

**With Custom Domain (recommended for production):**
```
EMAIL_FROM=TutorConnect <noreply@tutorconnect.com>
```
> You need to verify your domain in Resend dashboard first.

### 2. **REPLY-TO Address** (`EMAIL_REPLY_TO`)
This is where replies will be sent if recipients respond to the email.

```
EMAIL_REPLY_TO=support@tutorconnect.com
```

### 3. **Preview Text**
The preview text (inbox snippet) is automatically generated from the booking details:
- **Format**: "New booking request from [Parent Name] for [Subject] on [Date] at [Time]. Rate: $[Price]/hr"
- **Example**: "New booking request from John Doe for Mathematics on 2024-01-15 at 10:00 AM - 11:00 AM. Rate: $50/hr"

## How to Set Up

1. **Add to .env**: Copy the email variables above and add them to your `backend/.env` file.
2. **Verify Domain** (for production): Go to Resend dashboard → Domains → Add your domain.
3. **Restart Backend**: Run `npm run dev` in the backend directory.

## Current Configuration

The system will automatically:
- Use `EMAIL_FROM` if set, otherwise default to `onboarding@resend.dev`
- Use `EMAIL_REPLY_TO` if set, otherwise default to `support@tutorconnect.com`
- Generate preview text from booking details
