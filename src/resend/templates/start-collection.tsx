interface StartCollectionProps {
  recipientName: string;
  content: string;
  total: number;
  senderName: string;
}

const StartCollectionTemplate = ({
  recipientName,
  content,
  total,
  senderName,
}: StartCollectionProps): string => {
  return `<div>
  <h1>INVOICE</h1>

  <div>
    <p><strong>To:</strong> ${recipientName}</p>
    <p><strong>From:</strong> ${senderName}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
  </div>

  <div>
    <p>${content}</p>
  </div>

  <div>
    <p>Total: $${total.toFixed(2)}</p>
  </div>

  <hr />

  <p>Thank you for your business.</p>
</div>`;
};

export default StartCollectionTemplate;
