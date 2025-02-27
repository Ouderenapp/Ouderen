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

let FROM_EMAIL = "w.kastelijn@student.fontys.nl";

export function initializeEmailService(apiKey: string, fromEmail?: string) {
  mailService.setApiKey(apiKey);
  if (fromEmail) {
    FROM_EMAIL = fromEmail;
  }
  // Test the configuration with detailed logging
  console.log("Email service initialized with from address:", FROM_EMAIL);
  console.log("Testing SendGrid configuration...");

  // Verify API key is set
  if (!apiKey) {
    console.error("SendGrid API key is missing!");
    return;
  }
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    console.log("Attempting to send email to:", params.to);
    console.log("From address:", FROM_EMAIL);

    const msg: MailDataRequired = {
      to: params.to,
      from: {
        email: FROM_EMAIL,
        name: "Activiteitencentrum"
      },
      subject: params.subject,
      text: params.text || '',
      html: params.html || ''
    };

    console.log("Sending email with configuration:", JSON.stringify(msg, null, 2));

    const response = await mailService.send(msg);
    console.log("SendGrid API Response:", response);
    console.log("Email sent successfully to:", params.to);
    return true;
  } catch (error: any) {
    console.error("SendGrid email error details:");
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("SendGrid API error response:", {
        body: error.response.body,
        headers: error.response.headers,
        status: error.response.statusCode
      });
    }
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  console.log(`Sending welcome email to ${email} for ${name}`);
  return sendEmail({
    to: email,
    subject: "Welkom bij het Activiteitencentrum",
    html: `
      <h1>Welkom ${name}!</h1>
      <p>Bedankt voor het aanmaken van een account bij het Activiteitencentrum.</p>
      <p>U kunt nu deelnemen aan activiteiten en blijft op de hoogte van alles wat er gebeurt in uw buurt.</p>
      <p>Met vriendelijke groet,<br>Het Activiteitencentrum Team</p>
    `,
    text: `Welkom ${name}!\n\nBedankt voor het aanmaken van een account bij het Activiteitencentrum.\n\nU kunt nu deelnemen aan activiteiten en blijft op de hoogte van alles wat er gebeurt in uw buurt.\n\nMet vriendelijke groet,\nHet Activiteitencentrum Team`
  });
}

export async function sendActivityRegistrationEmail(
  email: string,
  name: string,
  activityName: string,
  activityDate: Date,
  location: string,
): Promise<boolean> {
  console.log(`Sending activity registration email to ${email} for ${activityName}`);
  return sendEmail({
    to: email,
    subject: `Aanmelding bevestigd: ${activityName}`,
    html: `
      <h1>Aanmelding bevestigd</h1>
      <p>Beste ${name},</p>
      <p>U bent succesvol aangemeld voor de activiteit "${activityName}".</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Datum: ${activityDate.toLocaleDateString("nl-NL", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</li>
        <li>Locatie: ${location}</li>
      </ul>
      <p>We kijken ernaar uit u te zien!</p>
      <p>Met vriendelijke groet,<br>Het Activiteitencentrum Team</p>
    `,
    text: `Aanmelding bevestigd\n\nBeste ${name},\n\nU bent succesvol aangemeld voor de activiteit "${activityName}".\n\nDetails:\n- Datum: ${activityDate.toLocaleDateString("nl-NL")}\n- Locatie: ${location}\n\nWe kijken ernaar uit u te zien!\n\nMet vriendelijke groet,\nHet Activiteitencentrum Team`
  });
}