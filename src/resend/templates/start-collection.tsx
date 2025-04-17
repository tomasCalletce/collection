import { format } from "date-fns";

interface StartCollectionProps {
  recipientName: string;
  body: string;
  total: number;
  senderName: string;
}

const StartCollectionTemplate = ({
  recipientName,
  body,
  total,
  senderName,
}: StartCollectionProps): string => {
  const today = new Date();
  const formattedDate = format(today, "MMMM d, yyyy");
  const currentYear = format(today, "yyyy");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Payment Request</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }
      .footer {
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px solid #eee;
        font-size: 14px;
        color: #666;
      }
      .amount {
        font-weight: bold;
        color: #2a5885;
        font-size: 18px;
      }
      .content {
        margin-bottom: 25px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <p><strong>To:</strong> ${recipientName}</p>
      <p><strong>From:</strong> ${senderName}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
    </div>

    <div class="content">
      ${body}
    </div>

    <div class="details">
      <p class="amount">Total Amount: $${total.toFixed(2)}</p>
    </div>

    <div class="footer">
      <p>Thank you for your business.</p>
      <p>&copy; ${currentYear} Nilho. All rights reserved.</p>
    </div>
  </body>
  </html>`;
};

export default StartCollectionTemplate;
