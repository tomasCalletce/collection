import * as React from "react";

interface InquiryEmailTemplateProps {
  firstName: string;
}

export const InquiryEmailTemplate: React.FC<
  Readonly<InquiryEmailTemplateProps>
> = ({ firstName }) => (
  <div>
    <h1>Welcome, {firstName}!</h1>
  </div>
);
