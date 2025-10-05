import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// ---------- Transporter ----------
const createTransporter = () => {
  const provider =
    process.env.EMAIL_PROVIDER ||
    (process.env.RESEND_API_KEY ? 'resend' : 'smtp'); // auto-pick Resend if key exists

  if (provider === 'resend') {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Adapter to mimic Nodemailer's `sendMail`
    return {
      async sendMail({ from, to, subject, text, html, replyTo, bcc }) {
        // Resend accepts string or array for to/bcc; reply_to uses underscore
        const { data, error } = await resend.emails.send({
          from,
          to,
          subject,
          text,
          html,
          bcc,
          reply_to: replyTo,
        });
        if (error) {
          // normalize error shape like nodemailer
          const msg = error.message || 'Resend send failed';
          const e = new Error(msg);
          e.response = error;
          throw e;
        }
        // Nodemailer usually returns { messageId }, return similar
        return { messageId: data?.id || undefined, id: data?.id };
      },
    };
  }

  if (process.env.EMAIL_SERVICE === 'gmail') {
    // Gmail (SMTP) – good for local dev; blocked on Render free tier
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD },
    });
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD },
  });
};

// ---------- Unified email look & helpers ----------
const BRAND = process.env.BRAND_NAME || 'Voices on Canvas';
const COLORS = {
  text: '#111827',
  subtext: '#6B7280',
  border: '#E5E7EB',
  accent: '#0F766E',
  panel: '#F9FAFB',
};

const wrapEmail = (title, bodyHtml) => `
  <div style="font-family: Inter, Arial, sans-serif; max-width:640px; margin:0 auto; padding:24px; border:1px solid ${COLORS.border}; border-radius:12px; background:#ffffff;">
    <div style="text-align:center; margin-bottom:12px;">
      <div style="font-weight:700; font-size:18px; letter-spacing:.2px; color:${COLORS.text};">${BRAND}</div>
    </div>
    <h2 style="margin:8px 0 16px; color:${COLORS.text}; font-size:20px; font-weight:700;">${title}</h2>
    <div style="color:${COLORS.text}; font-size:14px; line-height:1.6;">
      ${bodyHtml}
    </div>
    <hr style="border:none; border-top:1px solid ${COLORS.border}; margin:24px 0 12px;" />
    <p style="font-size:12px; color:${COLORS.subtext}; text-align:center; margin:0;">This is an automated message; please do not reply.</p>
  </div>
`;

const codeBlock = (value) => `
  <div style="background:${COLORS.panel}; border:1px solid ${COLORS.border}; border-radius:8px; padding:16px; text-align:center; margin:16px 0;">
    <div style="font-size:28px; font-weight:700; letter-spacing:4px; color:${COLORS.accent};">${value}</div>
  </div>
`;

const itemsTable = (items = []) => `
  <table cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:12px;">
    <thead>
      <tr>
        <th align="left" style="border-bottom:1px solid ${COLORS.border}; padding:8px;">Item</th>
        <th align="center" style="border-bottom:1px solid ${COLORS.border}; padding:8px;">Qty</th>
        <th align="right" style="border-bottom:1px solid ${COLORS.border}; padding:8px;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(i => `
        <tr>
          <td style="padding:8px; border-bottom:1px solid ${COLORS.border};">${i.name}</td>
          <td align="center" style="padding:8px; border-bottom:1px solid ${COLORS.border};">${i.qty}</td>
          <td align="right" style="padding:8px; border-bottom:1px solid ${COLORS.border};">₦${i.price}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;

// ---------- TEMPLATES ----------
export const emailTemplates = {
  // Auth flows
  verificationOTP: ({ name, otp }) => ({
    subject: 'Email Verification',
    text: `Hello ${name}, your verification code is ${otp}. This code expires in 10 minutes.`,
    html: wrapEmail('Email Verification', `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your verification code is:</p>
      ${codeBlock(otp)}
      <p>This code expires in 10 minutes.</p>
    `),
  }),

  passwordResetOTP: ({ name, otp }) => ({
    subject: 'Password Reset',
    text: `Hello ${name}, your password reset code is ${otp}. This code expires in 10 minutes.`,
    html: wrapEmail('Password Reset', `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your reset code is:</p>
      ${codeBlock(otp)}
      <p>This code expires in 10 minutes.</p>
    `),
  }),

  emailChangeVerification: ({ name, otp, newEmail }) => ({
    subject: 'Confirm Your New Email',
    text: `Hello ${name}, your email was changed to ${newEmail}. Use code ${otp} to verify within 10 minutes.`,
    html: wrapEmail('Confirm Your New Email', `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your email has been updated to <strong>${newEmail}</strong>. Use this code to verify:</p>
      ${codeBlock(otp)}
      <p>This code expires in 10 minutes.</p>
    `),
  }),

  passwordChanged: ({ name }) => ({
    subject: 'Password Changed',
    text: `Hello ${name}, your password was changed successfully. If this wasn’t you, please reset it immediately.`,
    html: wrapEmail('Password Changed', `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your password has been updated successfully. If this wasn’t you, please reset it immediately.</p>
    `),
  }),

  // General
  welcomeEmail: ({ name }) => ({
    subject: `Welcome to ${BRAND}`,
    text: `Hello ${name}, welcome to ${BRAND}. We’re glad to have you on board.`,
    html: wrapEmail('Welcome', `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Welcome to ${BRAND}. We’re glad to have you on board.</p>
    `),
  }),

  // Seller lifecycle
  sellerApprovalRequest: ({ userName, userEmail, adminName }) => ({
    subject: 'New Seller Request',
    text: `Hi ${adminName}, ${userName} (${userEmail}) requested a seller account.`,
    html: wrapEmail('New Seller Request', `
      <p>Hi <strong>${adminName}</strong>,</p>
      <p><strong>${userName}</strong> (${userEmail}) has requested a seller account.</p>
    `),
  }),

  sellerRequestProcessing: ({ userName }) => ({
    subject: 'We’ve received your seller application',
    text: `Hello ${userName}, your seller request is pending review. We’ll notify you once a decision is made.`,
    html: wrapEmail('Application Received', `
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Thanks for applying to become a seller. Your request is now pending review. We’ll notify you once a decision is made.</p>
    `),
  }),

  sellerDeclined: ({ userName }) => ({
    subject: 'Seller Application Declined',
    text: `Hello ${userName}, your seller application was declined. Contact support if you have questions.`,
    html: wrapEmail('Application Declined', `
      <p>Hello <strong>${userName}</strong>,</p>
      <p>We’re sorry to inform you that your seller application was declined. If you have questions, please contact support.</p>
    `),
  }),

  // ✅ Updated per your exact instructions (professional tone, bullets, no buttons)
  sellerApproved: ({ name }) => ({
    subject: 'Seller Account Approved',
    text:
`Hello ${name},
Your account has been upgraded to a seller account.

Sellers are responsible for properly packaging and shipping artworks to the buyer’s address provided at checkout.
* Sellers must provide valid tracking information within 48 hours of shipment.
* Payment to sellers will be held in escrow until 14 days after the buyer confirms receipt of the artwork or the delivery confirmation date is reached.
* Once the 14-day period elapses without dispute, funds will be released to the seller automatically.`,
    html: wrapEmail('Seller Account Approved', `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your account has been upgraded to a seller account.</p>
      <div style="background:${COLORS.panel}; border:1px solid ${COLORS.border}; border-radius:8px; padding:12px; margin-top:12px;">
        <p style="margin:0 0 8px; font-weight:600;">Please note:</p>
        <ul style="margin:0 0 0 18px; padding:0;">
          <li style="margin:6px 0;">Sellers are responsible for properly packaging and shipping artworks to the buyer’s address provided at checkout.</li>
          <li style="margin:6px 0;">Sellers must provide valid tracking information within <strong>48 hours</strong> of shipment.</li>
          <li style="margin:6px 0;">Payment to sellers will be held in escrow until <strong>14 days</strong> after the buyer confirms receipt of the artwork or the delivery confirmation date is reached.</li>
          <li style="margin:6px 0;">Once the 14-day period elapses without dispute, funds will be released to the seller automatically.</li>
        </ul>
      </div>
    `),
  }),

  // Product moderation
  newProductUploaded: ({ adminName, sellerName, sellerEmail, productName }) => ({
    subject: 'New Artwork Submitted',
    text: `Hi ${adminName}, ${sellerName} (${sellerEmail}) submitted “${productName}” for review.`,
    html: wrapEmail('New Artwork Submitted', `
      <p>Hi <strong>${adminName}</strong>,</p>
      <p><strong>${sellerName}</strong> (${sellerEmail}) submitted <strong>“${productName}”</strong> for review.</p>
    `),
  }),

  productSubmissionReceived: ({ name, productName }) => ({
    subject: 'Artwork Submission Received',
    text: `Hello ${name}, your artwork “${productName}” was received and is pending review.`,
    html: wrapEmail('Submission Received', `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your artwork <strong>“${productName}”</strong> has been received and is pending review.</p>
    `),
  }),

  productApproved: ({ sellerName, productName }) => ({
    subject: 'Artwork Approved',
    text: `Hi ${sellerName}, your artwork "${productName}" has been approved and is now live.`,
    html: wrapEmail('Artwork Approved', `
      <p>Hi <strong>${sellerName}</strong>,</p>
      <p>Your artwork <strong>“${productName}”</strong> has been approved and is now live.</p>
    `),
  }),

  productDeclined: ({ sellerName, productName }) => ({
    subject: 'Artwork Declined',
    text: `Hi ${sellerName}, your artwork "${productName}" was not approved. Contact support if you have questions.`,
    html: wrapEmail('Artwork Declined', `
      <p>Hi <strong>${sellerName}</strong>,</p>
      <p>Unfortunately, your artwork <strong>“${productName}”</strong> was not approved. If you have questions, please contact support.</p>
    `),
  }),

  // Orders
  orderConfirmation: ({ customerName, orderId, total, items }) => ({
    subject: `Order Confirmation – #${orderId}`,
    text:
`Hello ${customerName},
We’ve received your order #${orderId}.

Total: ₦${total}

Items:
${items.map(i => `- ${i.name} x${i.qty} — ₦${i.price}`).join('\n')}

We’ll notify you when your order ships.`,
    html: wrapEmail('Order Confirmation', `
      <p>Hello <strong>${customerName}</strong>,</p>
      <p>We’ve received your order <strong>#${orderId}</strong>.</p>
      ${itemsTable(items)}
      <p style="margin-top:12px;"><strong>Total:</strong> ₦${total}</p>
      <p>We’ll notify you when your order ships.</p>
    `),
  }),

  // ✅ Updated: add courier guidance + upload fields (no buttons)
  newOrderNotification: ({ sellerName, orderId, items }) => ({
    subject: `New Order – #${orderId}`,
    text:
`Hello ${sellerName},
You have a new order #${orderId}.

Please ship using a reliable courier service and upload the courier name and tracking number in your dashboard. Provide valid tracking within 48 hours of shipment.

Items:
${items.map(i => `- ${i.name} x${i.qty} — ₦${i.price}`).join('\n')}`,
    html: wrapEmail('New Order Received', `
      <p>Hello <strong>${sellerName}</strong>,</p>
      <p>You have a new order <strong>#${orderId}</strong>.</p>
      ${itemsTable(items)}
      <div style="background:${COLORS.panel}; border:1px solid ${COLORS.border}; border-radius:8px; padding:12px; margin-top:12px;">
        <p style="margin:0 0 8px; font-weight:600;">Next steps:</p>
        <ul style="margin:0 0 0 18px; padding:0;">
          <li style="margin:6px 0;">Ship using a reliable courier service.</li>
          <li style="margin:6px 0;">Upload the <strong>courier name</strong> and <strong>tracking number</strong> in your dashboard.</li>
          <li style="margin:6px 0;">Provide valid tracking within <strong>48 hours</strong> of shipment.</li>
        </ul>
      </div>
    `),
  }),

  payment_received: ({ orderNumber, totalPrice, shippingAddress }) => ({
    subject: `Payment Received – Order #${orderNumber}`,
    text:
`Payment received for Order #${orderNumber}.
Total: $${totalPrice}

Ship to:
${shippingAddress.address}
${shippingAddress.city}, ${shippingAddress.postalCode}
${shippingAddress.country}`,
    html: wrapEmail('Payment Received', `
      <p>Payment received for <strong>Order #${orderNumber}</strong>.</p>
      <p><strong>Total:</strong> $${totalPrice}</p>
      <div style="background:${COLORS.panel}; border:1px solid ${COLORS.border}; border-radius:8px; padding:12px; margin-top:12px;">
        <div style="font-weight:600; margin-bottom:6px;">Shipping Address</div>
        <div>${shippingAddress.address}</div>
        <div>${shippingAddress.city}, ${shippingAddress.postalCode}</div>
        <div>${shippingAddress.country}</div>
      </div>
    `),
  }),

  paymentReminder: ({ customerName, orderId }) => ({
    subject: `Payment Pending – Order #${orderId}`,
    text: `Hello ${customerName}, payment is pending for order #${orderId}. Please complete checkout to proceed with shipping.`,
    html: wrapEmail('Payment Pending', `
      <p>Hello <strong>${customerName}</strong>,</p>
      <p>Payment is pending for order <strong>#${orderId}</strong>. Please complete checkout to proceed with shipping.</p>
    `),
  }),

  order_shipped: ({ orderNumber, trackingNumber, carrier }) => ({
    subject: `Order Shipped – #${orderNumber}`,
    text:
`Your order #${orderNumber} has been shipped.

Carrier: ${carrier}
Tracking: ${trackingNumber}`,
    html: wrapEmail('Order Shipped', `
      <p>Your order <strong>#${orderNumber}</strong> has been shipped.</p>
      <div style="background:${COLORS.panel}; border:1px solid ${COLORS.border}; border-radius:8px; padding:12px; margin-top:12px;">
        <div><strong>Carrier:</strong> ${carrier}</div>
        <div><strong>Tracking:</strong> ${trackingNumber}</div>
      </div>
    `),
  }),

  order_delivered: ({ orderNumber }) => ({
    subject: `Order Delivered – #${orderNumber}`,
    text: `Order #${orderNumber} has been delivered.`,
    html: wrapEmail('Order Delivered', `
      <p>Order <strong>#${orderNumber}</strong> has been delivered.</p>
    `),
  }),

  // Disputes
  disputeRequestReceived: ({ orderNumber }) => ({
    subject: `Dispute Received – Order #${orderNumber}`,
    text: `We’ve received your dispute for Order #${orderNumber}. Our team will review and respond shortly.`,
    html: wrapEmail('Dispute Received', `
      <p>We’ve received your dispute for <strong>Order #${orderNumber}</strong>. Our team will review and respond shortly.</p>
    `),
  }),

  dispute_created: ({ orderNumber, reason, description }) => ({
    subject: `New Dispute – Order #${orderNumber}`,
    text:
`New dispute for Order #${orderNumber}
Reason: ${reason}
${description ? `Details: ${description}` : ''}`.trim(),
    html: wrapEmail('New Dispute Created', `
      <p><strong>Order:</strong> #${orderNumber}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      ${description ? `<p><strong>Details:</strong> ${description}</p>` : ''}
    `),
  }),

  dispute_notification: ({ orderNumber, reason, description }) => ({
    subject: `Dispute Opened – Order #${orderNumber}`,
    text:
`A dispute was opened for your Order #${orderNumber}.
Reason: ${reason}
${description ? `Details: ${description}` : ''}`.trim(),
    html: wrapEmail('Dispute Opened', `
      <p><strong>Order:</strong> #${orderNumber}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      ${description ? `<p><strong>Details:</strong> ${description}</p>` : ''}
    `),
  }),

  dispute_updated: ({ orderNumber, status, resolution }) => ({
    subject: `Dispute Update – Order #${orderNumber}`,
    text:
`Status for Order #${orderNumber}: ${status}
${resolution ? `Resolution: ${resolution}` : ''}`.trim(),
    html: wrapEmail(`Dispute Update – ${status}`, `
      <p><strong>Order:</strong> #${orderNumber}</p>
      ${resolution ? `<p><strong>Resolution:</strong> ${resolution}</p>` : ''}
    `),
  }),
};

// ---------- Sending utilities (unchanged) ----------
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!to) throw new Error('No recipient defined');
    if (!subject) throw new Error('No subject defined');
    if (!text && !html) throw new Error('No email content provided');

    const transporter = createTransporter();
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME;
    if (!from) throw new Error('No sender email configured');

    const info = await transporter.sendMail({ from, to, subject, text, html });
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

export const emailAllAdmins = async ({ adminEmails = [], subject, text, html, replyTo }) => {
  if (!subject) throw new Error('No subject provided');
  if (!text && !html) throw new Error('No email content provided');

  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME;
  if (!from) throw new Error('No sender email configured');

  const support = process.env.SUPPORT_EMAIL || from;
  const envAdmins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const bcc = [...new Set([...envAdmins, ...adminEmails])];

  const info = await transporter.sendMail({
    from,
    to: support,
    bcc: bcc.length ? bcc : undefined,
    subject,
    text,
    html,
    replyTo,
  });

  return info;
};

export const sendTemplateEmail = async ({ to, templateName, templateData = {} }) => {
  if (!emailTemplates[templateName]) {
    throw new Error(`Email template '${templateName}' not found`);
  }
  const { subject, text, html } = emailTemplates[templateName](templateData);
  return sendEmail({ to, subject, text, html });
};

export const sendNotificationEmail = async ({ to, type, orderData }) =>
  sendTemplateEmail({ to, templateName: type, templateData: orderData });

export const sendBulkNotifications = async (notifications) => {
  const results = [];
  for (const n of notifications) {
    try {
      const info = await sendNotificationEmail(n);
      results.push({ to: n.to, type: n.type, success: true, messageId: info.messageId });
    } catch (err) {
      results.push({ to: n.to, type: n.type, success: false, error: err.message });
    }
  }
  return results;
};

export const sendOTPEmail = async ({ to, name, otp, type = 'verification' }) => {
  const templateName = type === 'passwordReset' ? 'passwordResetOTP' : 'verificationOTP';
  return sendTemplateEmail({ to, templateName, templateData: { name, otp } });
};
