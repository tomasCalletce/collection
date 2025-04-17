import { format } from "date-fns";

interface ReminderCollectionInquiryProps {
  recipientName: string;
  body: string;
  total: number;
  senderName: string;
}

const ReminderCollectionInquiry = ({
  recipientName,
  body,
  total,
  senderName,
}: ReminderCollectionInquiryProps): string => {
  const today = new Date();
  const formattedDate = format(today, "MMMM d, yyyy");
  const currentYear = format(today, "yyyy");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Payment Reminder</title>
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
      .reminder-tag {
        display: inline-block;
        background-color: #ff6b6b;
        color: white;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 14px;
        margin-bottom: 15px;
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
        color: #333;
        font-size: 18px;
      }
      .content {
        margin-bottom: 25px;
      }
      .details {
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
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
      <p class="amount">Outstanding Amount: $${total.toFixed(2)}</p>
    </div>

    <div class="footer">
      <p>Thank you for your business.</p>
      <p>&copy; ${currentYear} Nilho. All rights reserved.</p>
    </div>
  </body>
  </html>`;
};

export default ReminderCollectionInquiry;
