import { Resend } from 'resend';

const FROM = 'Meditir <onboarding@meditir.com>';

let resendClient: Resend | null = null;
const getResend = (): Resend | null => {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
};

export const sendOnboardingEmail = async ({
  adminEmail,
  adminFirstName,
  hospitalName,
  hospitalSlug,
}: {
  adminEmail: string;
  adminFirstName: string;
  hospitalName: string;
  hospitalSlug: string;
}) => {
  console.log(`[email] sendOnboardingEmail called for ${adminEmail} (${hospitalName})`);
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping onboarding email');
    return;
  }

  const loginUrl = `${process.env.APP_URL || 'https://meditir.vercel.app'}/login`;
  const appUrl = process.env.APP_URL || 'https://meditir.vercel.app';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Meditir</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#030c0b;padding:36px 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(46,150,144,0.15);border:1px solid rgba(46,150,144,0.4);border-radius:10px;padding:8px 10px;vertical-align:middle;">
                    <span style="font-size:18px;">🎙️</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Meditir</span>
                  </td>
                </tr>
              </table>
              <p style="color:#4db0a8;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin:24px 0 8px;">Welcome aboard</p>
              <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0;line-height:1.2;">
                ${hospitalName} is live on Meditir
              </h1>
              <p style="color:#6b8f8d;font-size:15px;margin:12px 0 0;line-height:1.6;">
                Hi ${adminFirstName}, your hospital workspace is ready. Here's everything you need to get started.
              </p>
            </td>
          </tr>

          <!-- Login CTA -->
          <tr>
            <td style="padding:32px 40px 0;">
              <a href="${loginUrl}" style="display:inline-block;background:#237874;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:12px;letter-spacing:0.2px;">
                Sign in to your dashboard →
              </a>
              <p style="color:#9ca3af;font-size:13px;margin:10px 0 0;">
                ${loginUrl}
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px 0;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- Setup steps -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="color:#111827;font-size:17px;font-weight:700;margin:0 0 20px;">Your setup checklist</p>

              <!-- Step 1 -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;width:100%;">
                <tr>
                  <td style="width:36px;vertical-align:top;">
                    <div style="width:28px;height:28px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;text-align:center;line-height:28px;font-size:14px;font-weight:700;color:#16a34a;">1</div>
                  </td>
                  <td style="padding-left:12px;vertical-align:top;">
                    <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">Invite your doctors</p>
                    <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.5;">Go to <strong>Admin → Doctors → Add Doctor</strong> to add your medical staff and set their schedules.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;width:100%;">
                <tr>
                  <td style="width:36px;vertical-align:top;">
                    <div style="width:28px;height:28px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;text-align:center;line-height:28px;font-size:14px;font-weight:700;color:#2563eb;">2</div>
                  </td>
                  <td style="padding-left:12px;vertical-align:top;">
                    <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">Register your patients</p>
                    <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.5;">Add patient records under <strong>Admin → Patients</strong>. Include blood group, genotype, and allergies for AI-powered drug safety checks.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;width:100%;">
                <tr>
                  <td style="width:36px;vertical-align:top;">
                    <div style="width:28px;height:28px;background:#fefce8;border:1px solid #fef08a;border-radius:8px;text-align:center;line-height:28px;font-size:14px;font-weight:700;color:#ca8a04;">3</div>
                  </td>
                  <td style="padding-left:12px;vertical-align:top;">
                    <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">Schedule a consultation</p>
                    <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.5;">Book a session between a doctor and patient under <strong>Admin → Sessions → New Session</strong>.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 4 -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:0;width:100%;">
                <tr>
                  <td style="width:36px;vertical-align:top;">
                    <div style="width:28px;height:28px;background:#fdf4ff;border:1px solid #e9d5ff;border-radius:8px;text-align:center;line-height:28px;font-size:14px;font-weight:700;color:#9333ea;">4</div>
                  </td>
                  <td style="padding-left:12px;vertical-align:top;">
                    <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">Run your first AI consultation</p>
                    <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.5;">Have the doctor start the session and speak naturally. Meditir transcribes in real time and generates a full SOAP note in under 30 seconds.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px 0;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- Key features -->
          <tr>
            <td style="padding:28px 40px 0;">
              <p style="color:#111827;font-size:17px;font-weight:700;margin:0 0 16px;">What Meditir does for your hospital</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding-bottom:10px;">
                    <span style="color:#2e9690;font-weight:700;">🎙️ Real-time transcription</span>
                    <span style="color:#6b7280;font-size:13px;"> — Nigerian English, Yoruba, Hausa, Igbo accents supported</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:10px;">
                    <span style="color:#2e9690;font-weight:700;">📋 AI SOAP notes</span>
                    <span style="color:#6b7280;font-size:13px;"> — Generated by Claude AI in under 30 seconds, fully editable</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:10px;">
                    <span style="color:#2e9690;font-weight:700;">💊 Drug interaction alerts</span>
                    <span style="color:#6b7280;font-size:13px;"> — AI flags potential interactions before the note is signed</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:10px;">
                    <span style="color:#2e9690;font-weight:700;">📴 Offline mode</span>
                    <span style="color:#6b7280;font-size:13px;"> — Transcriptions are saved locally and sync when back online</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="color:#2e9690;font-weight:700;">👥 Multi-role access</span>
                    <span style="color:#6b7280;font-size:13px;"> — Separate dashboards for Admins, Doctors, and Patients</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Account info box -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#374151;font-size:13px;font-weight:600;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Your account details</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:13px;padding-bottom:6px;width:120px;">Hospital</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;padding-bottom:6px;">${hospitalName}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:13px;padding-bottom:6px;">Workspace</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;padding-bottom:6px;">${appUrl}/${hospitalSlug}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:13px;">Login email</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;">${adminEmail}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
                Need help getting started? Reply to this email or reach us at
                <a href="mailto:support@meditir.com" style="color:#2e9690;text-decoration:none;">support@meditir.com</a>
              </p>
              <p style="color:#d1d5db;font-size:11px;margin:16px 0 0;">
                © ${new Date().getFullYear()} Meditir · Built for healthcare in Nigeria
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { data: sendData, error: sendError } = await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `Welcome to Meditir — ${hospitalName} is ready`,
    html,
  });
  if (sendError) {
    console.error('[email] Resend rejected onboarding email:', JSON.stringify(sendError));
    throw new Error(`Resend error: ${sendError.name || 'unknown'} — ${sendError.message || JSON.stringify(sendError)}`);
  }
  console.log(`[email] Onboarding email sent to ${adminEmail}, id=${sendData?.id}`);
};

// Minimal markdown → HTML for AVS content (H2 headings, bullets, bold, line breaks).
// Intentionally small — no external deps, trusted input (Claude output we control).
const markdownToSafeHtml = (md: string): string => {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines = escape(md).split(/\r?\n/);
  const out: string[] = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^##\s+/.test(line)) {
      flushList();
      out.push(
        `<h2 style="color:#111827;font-size:16px;font-weight:700;margin:24px 0 8px;">${line.replace(/^##\s+/, '')}</h2>`
      );
    } else if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push('<ul style="margin:8px 0 8px 20px;padding:0;color:#374151;font-size:14px;line-height:1.6;">');
        inList = true;
      }
      out.push(`<li style="margin:4px 0;">${line.replace(/^[-*]\s+/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</li>`);
    } else if (line.length === 0) {
      flushList();
    } else {
      flushList();
      out.push(
        `<p style="color:#374151;font-size:14px;line-height:1.6;margin:8px 0;">${line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`
      );
    }
  }
  flushList();
  return out.join('\n');
};

const languageSubjects: Record<string, string> = {
  ENGLISH: 'Your visit summary',
  PIDGIN: 'Your visit summary',
  YORUBA: 'Àkọsílẹ̀ ìbẹ̀wò rẹ',
  HAUSA: 'Taƙaitaccen ziyarar ku',
  IGBO: 'Nchịkọta nleta gị',
};

export const sendPatientSummaryEmail = async ({
  patientEmail,
  patientFirstName,
  doctorName,
  hospitalName,
  contentMarkdown,
  language,
}: {
  patientEmail: string;
  patientFirstName: string;
  doctorName: string;
  hospitalName: string;
  contentMarkdown: string;
  language: 'ENGLISH' | 'PIDGIN' | 'YORUBA' | 'HAUSA' | 'IGBO';
}) => {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping patient summary email');
    return;
  }

  const bodyHtml = markdownToSafeHtml(contentMarkdown);
  const subject = `${languageSubjects[language] ?? languageSubjects.ENGLISH} — ${hospitalName}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#030c0b;padding:32px 40px;">
              <p style="color:#4db0a8;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">After-Visit Summary</p>
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;line-height:1.3;">Hello ${patientFirstName},</h1>
              <p style="color:#6b8f8d;font-size:14px;margin:10px 0 0;line-height:1.5;">
                Here is a summary of your visit with ${doctorName} at ${hospitalName}. Please read it carefully and keep it for your records.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 12px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 32px;">
              <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;">
                <p style="color:#92400e;font-size:13px;margin:0;line-height:1.5;">
                  <strong>Important:</strong> This summary is for your information only. If you have an emergency, go to the nearest hospital or call your doctor immediately.
                </p>
              </div>
              <p style="color:#9ca3af;font-size:11px;margin:20px 0 0;">
                Sent via Meditir · ${hospitalName}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  console.log(`[email] sendPatientSummaryEmail called for ${patientEmail}`);
  const { data: sendData, error: sendError } = await resend.emails.send({
    from: FROM,
    to: patientEmail,
    subject,
    html,
  });
  if (sendError) {
    console.error('[email] Resend rejected patient summary email:', JSON.stringify(sendError));
    throw new Error(`Resend error: ${sendError.name || 'unknown'} — ${sendError.message || JSON.stringify(sendError)}`);
  }
  console.log(`[email] Patient summary email sent to ${patientEmail}, id=${sendData?.id}`);
};
