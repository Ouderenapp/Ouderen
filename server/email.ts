import { MailService } from '@sendgrid/mail';
import type { MailDataRequired } from '@sendgrid/mail';

// Initialize the mail service
const mailService = new MailService();

interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

let FROM_EMAIL = 'noreply@activiteitencentrum.nl';

export function initializeEmailService(apiKey: string, fromEmail?: string) {
  mailService.setApiKey(apiKey);
  if (fromEmail) {
    FROM_EMAIL = fromEmail;
  }
  // Test the configuration
  console.log('Email service initialized with from address:', FROM_EMAIL);
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    console.log('Attempting to send email to:', params.to);
    const msg: MailDataRequired = {
      to: params.to,
      from: FROM_EMAIL,
      subject: params.subject,
      content: [
        {
          type: params.html ? 'text/html' : 'text/plain',
          value: params.html || params.text || '',
        },
      ],
    };

    await mailService.send(msg);
    console.log('Email sent successfully to:', params.to);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error:', error);
    if (error.response) {
      console.error('SendGrid API response:', error.response.body);
    }
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Welkom bij het Activiteitencentrum',
    html: `
      <h1>Welkom ${name}!</h1>
      <p>Bedankt voor het aanmaken van een account bij het Activiteitencentrum.</p>
      <p>U kunt nu deelnemen aan activiteiten en blijft op de hoogte van alles wat er gebeurt in uw buurt.</p>
      <p>Met vriendelijke groet,<br>Het Activiteitencentrum Team</p>
    `
  });
}

export async function sendActivityRegistrationEmail(
  email: string,
  name: string,
  activityName: string,
  activityDate: Date,
  location: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Aanmelding bevestigd: ${activityName}`,
    html: `
      <h1>Aanmelding bevestigd</h1>
      <p>Beste ${name},</p>
      <p>U bent succesvol aangemeld voor de activiteit "${activityName}".</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Datum: ${activityDate.toLocaleDateString('nl-NL', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</li>
        <li>Locatie: ${location}</li>
      </ul>
      <p>We kijken ernaar uit u te zien!</p>
      <p>Met vriendelijke groet,<br>Het Activiteitencentrum Team</p>
    `
  });
}