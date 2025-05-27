# Discount Approval Workflow Implementation

## Overview

This implementation provides a complete discount approval workflow system that integrates with the proposal pricing breakdown form. When sales reps attempt to apply discounts that exceed their authorized threshold, the system automatically triggers an approval request to managers.

## Key Features

### ✅ **Threshold-Based Approval System**
- Sales reps have configurable maximum discount percentages (default: 10%)
- Managers can approve higher discounts (default: 25%)
- Automatic validation when discounts exceed user limits

### ✅ **Real-Time Workflow**
- Instant approval request generation
- Real-time notifications to managers
- Database updates with activity logging
- Status tracking throughout the approval process

### ✅ **Complete UI Integration**
- **Pricing Breakdown Form**: Enhanced with discount validation
- **Manager Dashboard**: Comprehensive approval management interface
- **Real-time Updates**: Polling for live status updates
- **Notifications**: Toast notifications for all workflow events

## Implementation Details

### 1. Database Schema

```sql
-- Core approval requests table
approval_requests (
  id, proposal_id, requestor_id, approver_id,
  request_type, original_value, requested_value,
  status, notes, created_at, updated_at, processed_at
)

-- User permissions in admin_users table
max_discount_percent DECIMAL(5,2) DEFAULT 5.0
can_approve_discounts BOOLEAN DEFAULT false

-- Activity logging
activity_log (proposal_id, user_id, action, details, created_at)

-- Notifications system
notifications (user_id, type, title, message, data, read_at, created_at)
```

### 2. API Endpoints

#### **POST /api/approval-requests**
Creates new approval requests when discounts exceed thresholds
- Validates user permissions
- Finds available managers
- Sends notifications
- Returns approval request details

#### **PATCH /api/approval-requests/[id]**
Processes approval/rejection decisions
- Updates approval status
- Applies approved discounts to proposals
- Logs all activities
- Sends decision notifications

#### **GET /api/approval-requests**
Fetches approval requests with filtering options
- Status filtering (pending, approved, rejected)
- User-specific requests
- Includes related user and proposal data

### 3. Enhanced Components

#### **PricingBreakdownForm**
- **Location**: `components/proposal/pricing-breakdown-form.tsx`
- **Features**:
  - Discount threshold validation
  - Approval request dialog
  - Pending approval status display
  - Real-time permission checking

#### **Manager Approval Dashboard**
- **Location**: `app/admin/approvals/page.tsx`
- **Features**:
  - Tabbed interface (Pending, Approved, Rejected)
  - Search and filtering capabilities
  - One-click approve/reject actions
  - Detailed approval request information
  - Real-time updates every 30 seconds

### 4. Notification System

#### **NotificationService**
- **Location**: `lib/notifications.ts`
- **Capabilities**:
  - Manager notifications for new requests
  - Rep notifications for decisions
  - Database logging
  - Real-time broadcasting
  - Email integration ready

## Workflow Process

### 1. **Discount Request Initiation**
```typescript
// Rep enters discount amount
handleDiscountChange(discountValue)
↓
// System calculates discount percentage
discountPercent = (discountValue / subtotal) * 100
↓
// Check against user's limit
if (discountPercent > userPermissions.maxDiscountPercent) {
  // Trigger approval workflow
  showApprovalDialog()
}
```

### 2. **Approval Request Submission**
```typescript
// Submit to API
POST /api/approval-requests {
  proposalId, requestorId, requestType: 'discount',
  originalValue, requestedValue, notes
}
↓
// System finds available manager
// Creates approval request record
// Sends notification to manager
// Returns approval request details
```

### 3. **Manager Review Process**
```typescript
// Manager views pending requests
GET /api/approval-requests?status=pending
↓
// Manager makes decision
PATCH /api/approval-requests/[id] {
  action: 'approve'|'reject',
  notes: 'optional reasoning'
}
↓
// System updates proposal if approved
// Logs activity
// Notifies requestor
```

## Configuration

### User Permission Setup

```sql
-- Configure sales rep permissions
UPDATE admin_users 
SET max_discount_percent = 10.0, can_approve_discounts = false 
WHERE role = 'rep';

-- Configure manager permissions  
UPDATE admin_users 
SET max_discount_percent = 25.0, can_approve_discounts = true 
WHERE role = 'manager';
```

### Integration with Proposal Form

```typescript
// Pass required props to PricingBreakdownForm
<PricingBreakdownForm
  services={services}
  products={products}
  data={pricingData}
  updateData={setPricingData}
  proposalId={proposalId}        // Required for approval requests
  userId={currentUserId}         // Required for permission checking
/>
```

## Testing the Implementation

### 1. **Setup Test Users**
- Create a sales rep with 10% discount limit
- Create a manager with approval permissions
- Ensure both users have valid email addresses

### 2. **Test Discount Approval Flow**
1. Login as sales rep
2. Create/edit proposal
3. Enter discount > 10% of subtotal
4. Verify approval dialog appears
5. Submit approval request
6. Check manager receives notification

### 3. **Test Manager Approval**
1. Login as manager
2. Navigate to `/admin/approvals`
3. View pending request
4. Approve or reject with notes
5. Verify rep receives notification
6. Check proposal is updated (if approved)

## Real-Time Features

### **Auto-Refresh Mechanism**
```typescript
// Approval dashboard refreshes every 30 seconds
useEffect(() => {
  const interval = setInterval(fetchApprovalRequests, 30000)
  return () => clearInterval(interval)
}, [])
```

### **Optimistic Updates**
```typescript
// Immediate UI updates while API processes
setApprovalRequests(prev => 
  prev.map(req => 
    req.id === selectedRequest.id 
      ? { ...req, status: 'approved', notes: approvalNotes }
      : req
  )
)
```

## Security Considerations

### **Permission Validation**
- Server-side permission checking
- User role verification
- Threshold enforcement
- Activity logging for audit trails

### **Data Integrity**
- Transaction-based updates
- Referential integrity constraints
- Automatic timestamp management
- Comprehensive error handling

## Future Enhancements

### **Advanced Features Ready for Implementation**
1. **WebSocket Integration**: Real-time notifications
2. **Email Service**: Actual email notifications
3. **Mobile Push**: Mobile app notifications
4. **Advanced Permissions**: Role-based discount tiers
5. **Approval Chains**: Multi-level approval workflows
6. **Analytics Dashboard**: Approval metrics and reporting

### **Email Integration Example**
```typescript
// Add to NotificationService
import nodemailer from 'nodemailer'

static async sendEmailNotification(to: string, subject: string, message: string) {
  const transporter = nodemailer.createTransporter({
    // Email service configuration
  })
  
  await transporter.sendMail({ to, subject, text: message })
}
```

## Client Requirements Compliance

### ✅ **Manager Approval for Discount Thresholds**
- Automatic detection when discounts exceed limits
- Seamless approval request workflow
- Real-time manager notifications
- Complete audit trail

### ✅ **Integration with Existing Proposal Flow**
- Works within existing pricing breakdown
- No disruption to normal workflow
- Maintains all existing functionality
- Enhanced with approval capabilities

### ✅ **Real-Time Database Updates**
- Immediate status updates
- Activity logging
- Notification system
- Data consistency

This implementation fully satisfies the client's requirement for manager approval of discounts that exceed sales rep thresholds, with a complete real-time workflow integrated into the existing proposal system. 