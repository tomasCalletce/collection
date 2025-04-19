# Collection Workflow State Diagram

This diagram represents the states and transitions in the collection workflow process.

```mermaid
stateDiagram-v2
    [*] --> InvoiceReceived
    
    state InvoiceReceived {
        [*] --> PDFFormat
        [*] --> TextFormat
        PDFFormat --> ParsingAdapter
        TextFormat --> ParsingAdapter
        ParsingAdapter --> CanonicalDataset
    }
    
    state PriorityAssessment {
        [*] --> CalculateUrgency
        CalculateUrgency --> Critical: DueDate - CurrentDate <= 7 days
        CalculateUrgency --> High: 7 days < TimeTodue <= 15 days
        CalculateUrgency --> Medium: 15 days < TimeTodue <= 30 days
        CalculateUrgency --> Low: TimeTodue > 30 days
    }
    
    InvoiceReceived --> PriorityAssessment: Create canonical invoice data
    
    state EmailFollowUp {
        [*] --> WaitingResponse
        
        state WaitingResponse {
            [*] --> CriticalWait: Priority Critical
            [*] --> HighWait: Priority High
            [*] --> MediumWait: Priority Medium
            [*] --> LowWait: Priority Low
            
            CriticalWait --> ResponseAnalysis: Response received
            HighWait --> ResponseAnalysis: Response received
            MediumWait --> ResponseAnalysis: Response received
            LowWait --> ResponseAnalysis: Response received
            
            CriticalWait --> NoResponse: Wait 24h
            HighWait --> NoResponse: Wait 48h
            MediumWait --> NoResponse: Wait 72h
            LowWait --> NoResponse: Wait 1 week
        }
        
        state ResponseAnalysis {
            [*] --> IntentDetection
            IntentDetection --> PaymentConfirmed
            IntentDetection --> ErrorReported
            IntentDetection --> FuturePaymentDate
        }
    }
    
    PriorityAssessment --> EmailFollowUp: Send priority-based email template
    
    NoResponse --> PriorityAssessment: Reassess priority
    
    PaymentConfirmed --> HumanSupervision: Verify payment
    ErrorReported --> HumanSupervision: Review error
    
    FuturePaymentDate --> UpdatePaymentDate: Set new expected date
    UpdatePaymentDate --> PriorityAssessment: Reassess with new date
    
    state HumanSupervision {
        [*] --> ReviewCase
        ReviewCase --> ValidatePayment: Payment reported
        ReviewCase --> ErrorValidation: Error reported
        
        state ErrorValidation {
            [*] --> ErrorAnalysis
            ErrorAnalysis --> ErrorFixed: Correctable error
            ErrorAnalysis --> DataError: Invoice data error
            ErrorAnalysis --> SystemError: System error
        }
        
        ValidatePayment --> PaymentConfirmed: Payment verified
        ValidatePayment --> PaymentNotFound: Payment not found
        
        ErrorFixed --> PriorityAssessment: Restart workflow
        DataError --> InvoiceReceived: Reprocess invoice
        SystemError --> TechnicalReview: System fix needed
        PaymentNotFound --> PriorityAssessment: Restart collection
        
        PaymentConfirmed --> [*]: Close case
        TechnicalReview --> [*]: Escalate to tech team
    }
```

## State Descriptions

### Initial States
- **InvoiceReceived**: Initial state when an invoice is received in either PDF or Text format
- **ParsingAdapter**: Selection and application of appropriate parser based on input format
- **CanonicalDataset**: Standardized invoice data structure created

### Priority States
- **Critical**: Due date is within 7 days or overdue
- **High**: Due date is between 8-15 days
- **Medium**: Due date is between 16-30 days
- **Low**: Due date is more than 30 days away

### Email Communication States
- **InitialEmailSent**: Priority-based email template sent to client
- **WaitingResponse**: Different waiting periods based on priority:
  - Critical: 24 hours wait
  - High: 48 hours wait
  - Medium: 72 hours wait
  - Low: 1 week wait
- **ResponseAnalysis**: Processing and analyzing client's response

### Response Handling States
- **PaymentConfirmed**: Client indicates payment has been made
- **ErrorReported**: Client reports an issue with the invoice
- **FuturePaymentDate**: Client commits to a future payment date

### Human Supervision States
- **ReviewCase**: Initial human review of the case
- **ValidatePayment**: Verification of reported payments
- **ErrorValidation**: Analysis and categorization of reported errors:
  - **ErrorFixed**: Correctable errors that can resume workflow
  - **DataError**: Errors requiring invoice reprocessing
  - **SystemError**: Technical issues requiring escalation
- **PaymentNotFound**: Payment verification failed, restart collection
- **TechnicalReview**: System issues requiring technical team intervention

## Transitions
- System automatically calculates priority based on due date
- Email follow-up frequency varies by priority level
- Priority is reassessed after each no-response cycle
- Future payment dates trigger priority reassessment
- Human supervision can trigger workflow restarts:
  - After error correction
  - When payment verification fails
  - When invoice data needs reprocessing
- Technical issues are escalated to specialized teams