import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
// If not provided, it will fail gracefully when trying to send
const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingNotificationParams {
    tutorEmail: string;
    tutorName: string;
    parentName: string;
    subject: string;
    scheduledDate: string;
    scheduledTime: string;
    price: number;
}

/**
 * Send an email notification to the tutor when a new booking is made
 */
export async function sendBookingNotification({
    tutorEmail,
    tutorName,
    parentName,
    subject,
    scheduledDate,
    scheduledTime,
    price
}: BookingNotificationParams) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY is not set. Skipping email notification.');
            return { success: false, error: 'Missing API key' };
        }

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'TutorConnect <onboarding@resend.dev>',
            to: [tutorEmail],
            replyTo: process.env.EMAIL_REPLY_TO || 'support@tutorconnect.com',
            subject: `New Booking Request: ${subject} with ${parentName}`,
            text: `New booking request from ${parentName} for ${subject} on ${scheduledDate} at ${scheduledTime}. Rate: $${price}/hr`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>New Booking Request</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px; }
        .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #111827; }
        .card { background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .card-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #E5E7EB; padding-bottom: 10px; }
        .card-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .label { color: #6B7280; font-size: 14px; font-weight: 500; }
        .value { color: #111827; font-weight: 600; text-align: right; }
        .btn-container { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background-color 0.2s; }
        .btn:hover { background-color: #4338ca; }
        .footer { background-color: #F9FAFB; padding: 20px; text-align: center; color: #6B7280; font-size: 12px; border-top: 1px solid #E5E7EB; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TutorConnect</h1>
        </div>
        <div class="content">
            <div class="greeting">Hi ${tutorName},</div>
            <p>Great news! You have received a new booking request from <strong>${parentName}</strong>.</p>
            
            <div class="card">
                <div class="card-row">
                    <span class="label">Subject</span>
                    <span class="value">${subject}</span>
                </div>
                <div class="card-row">
                    <span class="label">Date</span>
                    <span class="value">${scheduledDate}</span>
                </div>
                <div class="card-row">
                    <span class="label">Time</span>
                    <span class="value">${scheduledTime}</span>
                </div>
                <div class="card-row">
                    <span class="label">Rate</span>
                    <span class="value">$${price}/hr</span>
                </div>
            </div>

            <p>Please review this request in your dashboard to accept or decline.</p>
            
            <div class="btn-container">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="btn">
                    View Dashboard
                </a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TutorConnect. All rights reserved.</p>
            <p>You received this email because you are a registered tutor on TutorConnect.</p>
        </div>
    </div>
</body>
</html>
            `
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error };
        }

        console.log('Booking notification email sent successfully:', data);
        return { success: true, data };

    } catch (error) {
        console.error('Exception sending email:', error);
        return { success: false, error };
    }
}
