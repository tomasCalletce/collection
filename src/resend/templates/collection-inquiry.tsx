import * as React from "react";

interface CollectionInquiryTemplateProps {
  firstName: string;
}

export const CollectionInquiryTemplate: React.FC<
  Readonly<CollectionInquiryTemplateProps>
> = ({ firstName }) => (
  <div>
    <h1>Welcome, {firstName}!</h1>
  </div>
);

export default CollectionInquiryTemplate;
