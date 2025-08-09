
import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

// Create transporter based on your email service settings
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// All email templates in one unified object
export const emailTemplates = {
  // Verification & password flows
  verificationOTP: ({ name, otp }) => ({
    subject: 'Email Verification',
    text: `Hello ${name}, your verification code is ${otp}.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#333;text-align:center;">Email Verification</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your verification code is:</p>
        <div style="background:#f8f9fa;padding:20px;text-align:center;border-radius:5px;margin:20px 0;">
          <h1 style="color:#007bff;font-size:32px;letter-spacing:5px;">${otp}</h1>
        </div>
        <p>This code expires in 10 minutes.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
      </div>
    `,
  }),

  passwordResetOTP: ({ name, otp }) => ({
    subject: 'Password Reset Request',
    text: `Hello ${name}, your password reset code is ${otp}.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#333;text-align:center;">Password Reset</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your reset code is:</p>
        <div style="background:#fff3cd;padding:20px;text-align:center;border-radius:5px;margin:20px 0;border:1px solid #ffeaa7;">
          <h1 style="color:#856404;font-size:32px;letter-spacing:5px;">${otp}</h1>
        </div>
        <p>This code expires in 10 minutes.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
      </div>
    `,
  }),

  welcomeEmail: ({ name }) => ({
    subject: 'Welcome to Our Store!',
    text: `Hello ${name}, welcome to our art platform! Start shopping now.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#333;text-align:center;">Welcome!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thanks for joining our art community.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${process.env.FRONTEND_URL}/products" style="background:#007bff;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;">Start Shopping</a>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
      </div>
    `,
  }),

  passwordChanged: ({ name }) => ({
    subject: 'Password Changed',
    text: `Hello ${name}, your password was changed successfully.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#333;text-align:center;">Password Changed</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your password has been updated. If this wasn't you, reset immediately.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
      </div>
    `,
  }),

  // Seller approval emails
  sellerApprovalRequest: ({ userName, userEmail, adminName }) => ({
    subject: 'New Seller Request',
    text: `Hi ${adminName}, ${userName} (${userEmail}) has requested a seller account.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#333;text-align:center;">New Seller Request</h2>
        <p>Hi <strong>${adminName}</strong>,</p>
        <p><strong>${userName}</strong> (${userEmail}) has requested a seller account.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${process.env.FRONTEND_URL}/admin/seller-requests" style="background:#007bff;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;">Review Request</a>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
      </div>
    `,
  }),
    sellerRequestProcessing: ({ userName }) => ({
    subject: 'We’ve received your seller application',
    text: `Hello ${userName}, your request is now pending review.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="text-align:center;color:#333;">Request Received</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>Thanks for applying to become a seller. Your request is now pending review by our team. We’ll let you know as soon as it’s approved.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
        <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
      </div>
    `,
  }),

  // 2️⃣ User “request declined” notification
  sellerDeclined: ({ userName }) => ({
    subject: 'Your seller application was declined',
    text: `Hello ${userName}, unfortunately your request to become a seller was declined.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="text-align:center;color:#dc3545;">Application Declined</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>We’re sorry to inform you that your seller application has been declined. If you have questions, please contact support.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
        <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
      </div>
    `,
  }),

  sellerApproved: ({ name }) => ({
    subject: 'Your Seller Account Has Been Approved 🎉',
    text: `Congratulations ${name}! Your seller account has been approved.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h1 style="color:#28a745;text-align:center;">Congratulations ${name}! 🎉</h1>
        <p>Your account has been successfully upgraded to a seller account on <strong>Voices on Canvas</strong>.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${process.env.FRONTEND_URL}/upload-art" style="background:#28a745;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;">Start Selling</a>
        </div>
        <p>Happy selling! 💛</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
      </div>
    `,
  }),

  // Email change verification
  emailChangeVerification: ({ name, otp, newEmail }) => ({
    subject: 'Email Verification Required',
    text: `Hello ${name}, your email has been changed to ${newEmail}. Please verify with OTP: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#333;text-align:center;">Email Change Verification</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your email has been changed to <strong>${newEmail}</strong>. Here’s your code:</p>
        <div style="background:#f8f9fa;padding:20px;text-align:center;border-radius:5px;margin:20px 0;">
          <h1 style="color:#007bff;font-size:32px;letter-spacing:5px;">${otp}</h1>
        </div>
        <p>This code expires in 10 minutes.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
      </div>
    `,
  }),

  orderConfirmation : ({ customerName, orderId, total, items }) => ({
  subject: `Thank you for your order, ${customerName}!`,
  text: `Hi ${customerName},\n\nWe’ve received your order #${orderId}. Your order total is ₦${total}.\n\nThank you for shopping with us!`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
      <h2 style="color:#333;text-align:center;">Order Confirmation</h2>
      <p>Hello <strong>${customerName}</strong>,</p>
      <p>Thank you for your purchase! We’ve received your order <strong>#${orderId}</strong> successfully.</p>

      <h3>Order Summary</h3>
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse: collapse; margin-top:16px;">
        <thead>
          <tr>
            <th align="left" style="border-bottom:1px solid #ddd; padding:8px;">Item</th>
            <th align="center" style="border-bottom:1px solid #ddd; padding:8px;">Qty</th>
            <th align="right" style="border-bottom:1px solid #ddd; padding:8px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(i => `
            <tr>
              <td style="padding:8px; border-bottom:1px solid #eee;">${i.name}</td>
              <td align="center" style="padding:8px; border-bottom:1px solid #eee;">${i.qty}</td>
              <td align="right" style="padding:8px; border-bottom:1px solid #eee;">₦${i.price}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" align="right" style="padding:8px; font-weight:bold;">Total:</td>
            <td align="right" style="padding:8px; font-weight:bold;">₦${total}</td>
          </tr>
        </tfoot>
      </table>

      <p style="margin-top:20px;">We’ll let you know when your items ship.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
      <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
    </div>
  `,
}),

newOrderNotification : ({ sellerName, orderId, items }) => ({
  subject: `New order received: #${orderId}`,
  text: `Hi ${sellerName},\n\nYou’ve got a new order #${orderId}!`, 
  html: `
    <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
      <h2 style="color:#333;text-align:center;">New Order Received</h2>
      <p>Hello <strong>${sellerName}</strong>,</p>
      <p>You have a new order <strong>#${orderId}</strong>. Here are the items:</p>

      <table cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse: collapse; margin-top:16px;">
        <thead>
          <tr>
            <th align="left" style="border-bottom:1px solid #ddd; padding:8px;">Item</th>
            <th align="center" style="border-bottom:1px solid #ddd; padding:8px;">Qty</th>
            <th align="right" style="border-bottom:1px solid #ddd; padding:8px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(i => `
            <tr>
              <td style="padding:8px; border-bottom:1px solid #eee;">${i.name}</td>
              <td align="center" style="padding:8px; border-bottom:1px solid #eee;">${i.qty}</td>
              <td align="right" style="padding:8px; border-bottom:1px solid #eee;">₦${i.price}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <p style="margin-top:20px;">Please prepare these items for shipping.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
      <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
    </div>
  `,
}),

  newProductUploaded: ({ adminName, sellerName, sellerEmail, productName, productId }) => ({
    subject: 'New Art Uploaded',
    text: `Hi ${adminName}, ${sellerName} (${sellerEmail}) just uploaded “${productName}”.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2>New Art Uploaded</h2>
        <p>Hi <strong>${adminName}</strong>,</p>
        <p><strong>${sellerName}</strong> (${sellerEmail}) has just uploaded a new art piece:</p>
        <p><strong>${productName}</strong></p>
        <p><a href="${process.env.FRONTEND_URL}/admin/products/${productId}">Review &amp; Approve</a></p>
        <hr/>
        <p style="font-size:12px;color:#666;">Automated message, do not reply.</p>
      </div>
    `,
  }),

  // 2️⃣ Confirmation to the seller that their submission is pending review
  productSubmissionReceived: ({ name, productName, productId }) => ({
    subject: 'Your art submission is pending approval',
    text: `Hello ${name}, your art “${productName}” is now pending approval.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2>Submission Received</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your art piece <strong>“${productName}”</strong> has been submitted and is pending review by our team.</p>
        <p>You can check its status here: <a href="${process.env.FRONTEND_URL}/seller/products/${productId}">View My Products</a></p>
        <hr/>
        <p style="font-size:12px;color:#666;">Automated message, do not reply.</p>
      </div>
    `,
  }),

    productApproved: ({ sellerName, productName, productId }) => ({
    subject: 'Your art has been approved! 🎉',
    text: `Hi ${sellerName}, your product "${productName}" is now live on our platform!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="text-align:center;color:#28a745;">Product Approved</h2>
        <p>Hi <strong>${sellerName}</strong>,</p>
        <p>Your art piece <strong>"${productName}"</strong> has been approved and is now available for purchase!</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${process.env.FRONTEND_URL}/products/${productId}" style="background:#28a745;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;">View Your Product</a>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
      </div>
    `,
  }),

  productDeclined: ({ sellerName, productName, productId }) => ({
    subject: 'Your art submission was declined',
    text: `Hi ${sellerName}, your product "${productName}" was not approved.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="text-align:center;color:#dc3545;">Submission Declined</h2>
        <p>Hi <strong>${sellerName}</strong>,</p>
        <p>Unfortunately, your art piece <strong>"${productName}"</strong> did not meet our guidelines and has been declined.</p>
        <p>If you have questions, please <a href="mailto:${process.env.SUPPORT_EMAIL}">contact support</a>.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
      </div>
    `,
  }),

  // Order & dispute notifications
  payment_received: ({ orderNumber, totalPrice, shippingAddress }) => ({
    subject: `Payment Received - Order #${orderNumber}`,
    text: `Payment received for Order #${orderNumber}. Total: $${totalPrice}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#28a745;">Payment Received!</h2>
        <p>Your order has been paid. Please ship ASAP.</p>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
          <h3>Order #${orderNumber}</h3>
          <p><strong>Total:</strong> $${totalPrice}</p>
        </div>
        <div style="background:#e3f2fd;padding:20px;border-radius:8px;margin:20px 0;">
          <h3>Shipping Address</h3>
          <p>${shippingAddress.address}<br>${shippingAddress.city}, ${shippingAddress.postalCode}<br>${shippingAddress.country}</p>
        </div>
        <p>Update shipping details in your dashboard.</p>
        <p>— Art Platform Team</p>
      </div>
    `,
  }),

  paymentReminder: ({ customerName, orderId }) => ({
    subject: `Complete payment for Order #${orderId}`,
    text: `Hi ${customerName}, please complete your payment for order #${orderId} to get your art shipped!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="text-align:center;color:#333;">Almost There!</h2>
        <p>Hello <strong>${customerName}</strong>,</p>
        <p>You’ve placed order <strong>#${orderId}</strong> but we haven’t received payment yet. Click below to complete checkout and we’ll ship your art!</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${process.env.FRONTEND_URL}/orders/${orderId}/pay" style="background:#007bff;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;">Pay Now</a>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="font-size:12px;color:#666;text-align:center;">Automated message, do not reply.</p>
      </div>
    `,
  }),

  order_shipped: ({ orderNumber, trackingNumber, carrier }) => ({
    subject: `Your Order Has Been Shipped - #${orderNumber}`,
    text: `Your order #${orderNumber} has been shipped. Tracking: ${trackingNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#007bff;">Order Shipped!</h2>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
          <p><strong>Order:</strong> #${orderNumber}</p>
          <p><strong>Tracking:</strong> ${trackingNumber}</p>
          <p><strong>Carrier:</strong> ${carrier}</p>
        </div>
        <p>Your order is on its way. Confirm when received.</p>
        <p>— Art Platform Team</p>
      </div>
    `,
  }),

  

  order_delivered: ({ orderNumber }) => ({
    subject: `Order Delivered - #${orderNumber}`,
    text: `Order #${orderNumber} has been delivered.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#28a745;">Order Delivered</h2>
        <p>The buyer has confirmed delivery for Order #${orderNumber}.</p>
        <p>— Art Platform Team</p>
      </div>
    `,
  }),
    disputeRequestReceived: ({ orderNumber }) => ({
    subject: `We’ve received your dispute for Order #${orderNumber}`,
    text: `We’ve received your dispute for Order #${orderNumber} and our team will review it shortly.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;
                  border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#333;text-align:center;">Dispute Received</h2>
        <p>We’ve received your dispute for <strong>Order #${orderNumber}</strong>.</p>
        <p>Our team will review it and get back to you as soon as possible.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="font-size:12px;color:#666;text-align:center;">
          Automated message, do not reply.
        </p>
      </div>
    `,
  }),

  

  dispute_created: ({ orderNumber, reason, description }) => ({
    subject: `New Dispute - Order #${orderNumber}`,
    text: `New dispute created for Order #${orderNumber}. Reason: ${reason}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#dc3545;">New Dispute Created</h2>
        <p><strong>Order:</strong> #${orderNumber}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
        <p>— Admin Team</p>
      </div>
    `,
  }),

  dispute_notification: ({ orderNumber, reason, description }) => ({
    subject: `Dispute for Your Order #${orderNumber}`,
    text: `A dispute has been opened for your Order #${orderNumber}. Reason: ${reason}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#ffc107;">Dispute Opened</h2>
        <p><strong>Order:</strong> #${orderNumber}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
        <p>We will review it shortly.</p>
        <p>— Art Platform Team</p>
      </div>
    `,
  }),

  dispute_updated: ({ orderNumber, status, resolution }) => ({
    subject: `Dispute Update - Order #${orderNumber}`,
    text: `Dispute status updated for Order #${orderNumber}. Status: ${status}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#17a2b8;">Dispute Status: ${status}</h2>
        <p><strong>Order:</strong> #${orderNumber}</p>
        ${resolution ? `<p><strong>Resolution:</strong> ${resolution}</p>` : ''}
        <p>— Art Platform Team</p>
      </div>
    `,
  }),
};

// Low-level send function with better error handling
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!to) throw new Error('No recipient defined');
    if (!subject) throw new Error('No subject defined');
    if (!text && !html) throw new Error('No email content provided');

    const transporter = createTransporter();
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME;
    if (!from) throw new Error('No sender email configured');

    console.log(`📧 Sending email to: ${to}, Subject: ${subject}`);
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`✅ Email sent. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

export const emailAllAdmins = async ({
  adminEmails = [],   // optional extra admins from DB
  subject,
  text,
  html,
  replyTo,            // lets admins reply straight to the sender
}) => {
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

  const bcc = [...new Set([...envAdmins, ...adminEmails])]; // dedupe

  // Send to support, BCC all admins
  const info = await transporter.sendMail({
    from,
    to: support,
    bcc: bcc.length ? bcc : undefined,
    subject,
    text,
    html,
    replyTo, // so admin “Reply” goes to the user who filled the form
  });

  return info;
};



// (async () => {
//   try {
//     await sendEmail({
//       to: process.env.ADMIN_EMAIL || process.env.EMAIL_USERNAME,
//       subject: '🧪 SMTP Test Email',
//       text: 'If you receive this, SMTP is configured correctly.',
//     });
//     console.log('✅ Test email sent');
//   } catch (err) {
//     console.error('❌ Test email error:', err);
//   }
// })();

// Template-based send
export const sendTemplateEmail = async ({ to, templateName, templateData = {} }) => {
  if (!emailTemplates[templateName]) {
    throw new Error(`Email template '${templateName}' not found`);
  }
  const { subject, text, html } = emailTemplates[templateName](templateData);
  return sendEmail({ to, subject, text, html });
};

// Convenience wrappers
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

// export const declineSeller = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id);

//   if (!user) {
//     res.status(404);
//     throw new Error('User not found');
//   }

//   // 1) clear any pending seller‐request flags
//   user.sellerRequested = false;
//   user.isSeller = false;
//   user.sellerApproved = false;
//   await user.save();

//   // 2) notify the user that their request was declined
//   try {
//     await sendSellerEmail({
//       to: user.email,
//       type: 'declined',
//       userData: { name: user.name }
//     });
//     console.log(`✅ Decline email sent to ${user.email}`);
//   } catch (err) {
//     console.error(`❌ Failed to send decline email to ${user.email}:`, err);
//   }

//   // 3) respond to the client
//   res.json({ message: 'Seller request declined' });
// });



// export default sendEmail;
