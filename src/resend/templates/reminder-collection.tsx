interface ReminderCollectionInquiryProps {
  firstName: string;
}

const ReminderCollectionInquiry = ({
  firstName,
}: ReminderCollectionInquiryProps): string => {
  return `<div>
    <h1>Welcome, ${firstName}!</h1>
  </div>`;
};

export default ReminderCollectionInquiry;
