// server.js
// ---------------------------------------------------
// Express + Nodemailer backend for the e-commerce site
// All form submissions (Contact, Product Enquiry, Cart
// Order / Buy Now) are emailed directly to the owner.
// ---------------------------------------------------

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Owner details
const OWNER_NAME = 'Adarsh Pal';
const OWNER_EMAIL = 'jackysparrow738392@gmail.com';

// ---------------------------------------------------
// Middleware
// ---------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (index.html, style.css, script.js, etc.)
app.use(express.static(path.join(__dirname)));

// ---------------------------------------------------
// Nodemailer transporter
// Uses Gmail + an App Password (NOT your normal Gmail password)
// Set these in a .env file:
//   EMAIL_USER=your_gmail_address@gmail.com
//   EMAIL_PASS=your_16_char_app_password
// ---------------------------------------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper to send mail and return a promise
function sendMail(subject, html) {
  const mailOptions = {
    from: `"${OWNER_NAME}'s Store" <${process.env.EMAIL_USER}>`,
    to: OWNER_EMAIL,
    replyTo: process.env.EMAIL_USER,
    subject,
    html
  };
  return transporter.sendMail(mailOptions);
}

// ---------------------------------------------------
// Helper: build a nice HTML table from key/value pairs
// ---------------------------------------------------
function buildTable(rows) {
  const tableRows = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 12px;border:1px solid #e2e2e2;font-weight:600;background:#f7f7f7;">${label}</td>
        <td style="padding:8px 12px;border:1px solid #e2e2e2;">${value}</td>
      </tr>`
    )
    .join('');

  return `
    <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:Arial,sans-serif;font-size:14px;">
      ${tableRows}
    </table>`;
}

// ---------------------------------------------------
// ROUTE: Product Enquiry / "Buy Now" form
// Expects: name, email, phone, product, message
// ---------------------------------------------------
app.post('/api/enquiry', async (req, res) => {
  try {
    const { name, email, phone, product, message } = req.body;

    if (!name || !email || !phone || !product) {
      return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
    }

    const html = `
      <h2 style="font-family:Arial,sans-serif;color:#1a1a2e;">New Product Enquiry / Buy Now Request</h2>
      ${buildTable([
        ['Customer Name', name],
        ['Customer Email', email],
        ['Phone Number', phone],
        ['Product Name', product],
        ['Message', message || '(No additional message)']
      ])}
      <p style="font-family:Arial,sans-serif;color:#555;margin-top:16px;">
        This enquiry was submitted from your e-commerce website.
      </p>`;

    await sendMail(`New Enquiry: ${product} - from ${name}`, html);

    res.json({ success: true, message: 'Your enquiry has been sent successfully! We will contact you soon.' });
  } catch (err) {
    console.error('Enquiry email error:', err);
    res.status(500).json({ success: false, error: 'Something went wrong while sending your enquiry. Please try again later.' });
  }
});

// ---------------------------------------------------
// ROUTE: Contact form
// Expects: name, email, phone, message
// ---------------------------------------------------
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
    }

    const html = `
      <h2 style="font-family:Arial,sans-serif;color:#1a1a2e;">New Contact Form Message</h2>
      ${buildTable([
        ['Customer Name', name],
        ['Customer Email', email],
        ['Phone Number', phone || 'Not provided'],
        ['Message', message]
      ])}
      <p style="font-family:Arial,sans-serif;color:#555;margin-top:16px;">
        This message was submitted from the Contact page of your website.
      </p>`;

    await sendMail(`New Contact Message from ${name}`, html);

    res.json({ success: true, message: 'Your message has been sent successfully! We will get back to you soon.' });
  } catch (err) {
    console.error('Contact email error:', err);
    res.status(500).json({ success: false, error: 'Something went wrong while sending your message. Please try again later.' });
  }
});

// ---------------------------------------------------
// ROUTE: Cart / Order submission
// Expects: name, email, phone, message, items (array), total
// ---------------------------------------------------
app.post('/api/order', async (req, res) => {
  try {
    const { name, email, phone, message, items, total } = req.body;

    if (!name || !email || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Please fill in all required fields and add items to your cart.' });
    }

    const itemsRows = items
      .map(
        (item) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e2e2e2;">${item.name}</td>
          <td style="padding:8px 12px;border:1px solid #e2e2e2;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border:1px solid #e2e2e2;text-align:right;">₹${item.price}</td>
          <td style="padding:8px 12px;border:1px solid #e2e2e2;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
      )
      .join('');

    const itemsTable = `
      <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:Arial,sans-serif;font-size:14px;margin-top:10px;">
        <thead>
          <tr style="background:#1a1a2e;color:#fff;">
            <th style="padding:8px 12px;border:1px solid #e2e2e2;text-align:left;">Product</th>
            <th style="padding:8px 12px;border:1px solid #e2e2e2;">Qty</th>
            <th style="padding:8px 12px;border:1px solid #e2e2e2;">Price</th>
            <th style="padding:8px 12px;border:1px solid #e2e2e2;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:8px 12px;border:1px solid #e2e2e2;text-align:right;font-weight:700;">Grand Total</td>
            <td style="padding:8px 12px;border:1px solid #e2e2e2;text-align:right;font-weight:700;">₹${total}</td>
          </tr>
        </tfoot>
      </table>`;

    const html = `
      <h2 style="font-family:Arial,sans-serif;color:#1a1a2e;">New Order Placed</h2>
      ${buildTable([
        ['Customer Name', name],
        ['Customer Email', email],
        ['Phone Number', phone],
        ['Message / Notes', message || '(No additional message)']
      ])}
      <h3 style="font-family:Arial,sans-serif;color:#1a1a2e;margin-top:20px;">Order Details</h3>
      ${itemsTable}
      <p style="font-family:Arial,sans-serif;color:#555;margin-top:16px;">
        This order was placed from the Cart page of your website. Please contact the customer to confirm and arrange payment/delivery.
      </p>`;

    await sendMail(`New Order from ${name} - Total ₹${total}`, html);

    res.json({ success: true, message: 'Your order has been placed successfully! We will contact you shortly to confirm.' });
  } catch (err) {
    console.error('Order email error:', err);
    res.status(500).json({ success: false, error: 'Something went wrong while placing your order. Please try again later.' });
  }
});

// ---------------------------------------------------
// Fallback route -> serve index.html for unknown GET routes
// ---------------------------------------------------
app.get('*', (req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---------------------------------------------------
// Start server
// ---------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`All form submissions will be sent to: ${OWNER_EMAIL}`);
});

