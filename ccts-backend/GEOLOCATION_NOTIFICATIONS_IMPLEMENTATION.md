# Geolocation & Notifications Implementation

## Summary
This document describes the implementation of geolocation, camera access, and Twilio-based notifications (Email, SMS, Push) for the CivicWatch corruption complaint system.

## Changes Made

### Backend Changes

#### 1. Geolocation Support
- **Complaint Entity** (`src/main/java/com/ccts/model/Complaint.java`):
  - Added `latitude` (Double)
  - Added `longitude` (Double)
  - Added `accuracy` (Float)

- **ComplaintRequest DTO** (`src/main/java/com/ccts/dto/ComplaintRequest.java`):
  - Added `latitude`, `longitude`, `accuracy` fields

- **ComplaintResponse DTO** (`src/main/java/com/ccts/dto/ComplaintResponse.java`):
  - Added `latitude`, `longitude`, `accuracy` fields

- **ComplaintService** (`src/main/java/com/ccts/service/ComplaintService.java`):
  - Updated `submitComplaint()` to map geolocation fields
  - Updated `mapToResponse()` to include geolocation in response
  - Added `updateComplaintStatus()` method with notification integration

#### 2. File Upload
- **FileController** (`src/main/java/com/ccts/controller/FileController.java`):
  - New endpoint: `POST /api/v1/files/upload`
  - Accepts MultipartFile, validates type (images only) and size (max 10MB)
  - Saves files to `./uploads/evidence` directory
  - Returns file URL for access

- **WebConfig** (`src/main/java/com/ccts/config/WebConfig.java`):
  - Configures resource handler to serve files from `/uploads/evidence/**`

#### 3. Notifications (Twilio + SendGrid)
- **Dependencies** (`pom.xml`):
  - Added Twilio Java SDK (9.2.2)
  - Added SendGrid Java SDK (4.9.3)

- **Configuration** (`src/main/resources/application.yml`):
  - Added Twilio configuration: `twilio.account-sid`, `twilio.auth-token`, `twilio.phone-number`
  - Added SendGrid configuration: `sendgrid.api-key`, `sendgrid.from-email`, `sendgrid.from-name`
  - Added notification settings: `notification.enabled`, `notification.admin-email`, `notification.admin-phone`, etc.

- **NotificationProperties** (`src/main/java/com/ccts/config/NotificationProperties.java`):
  - Configuration properties bean for notification settings

- **NotificationService** (`src/main/java/com/ccts/service/NotificationService.java`):
  - Sends email via SendGrid
  - Sends SMS via Twilio
  - Placeholder for push notifications (can be extended with Firebase or Twilio Notify)
  - Methods:
    - `sendComplaintSubmittedNotification()` - triggered when new complaint is submitted
    - `sendStatusUpdateNotification()` - triggered when complaint status changes
    - `sendAssignmentNotification()` - triggered when complaint is assigned to officer
  - Includes fallback logging when API keys are not configured

#### 4. Notification Integration
- **ComplaintService**:
  - Injected `NotificationService`
  - Calls `notificationService.sendComplaintSubmittedNotification()` after saving complaint

- **AdminService** (`src/main/java/com/ccts/service/AdminService.java`):
  - Injected `NotificationService`
  - Updated `mapToResponse()` to include geolocation fields
  - Calls `notificationService.sendStatusUpdateNotification()` in `updateComplaintStatus()`
  - Calls `notificationService.sendAssignmentNotification()` in `assignComplaintToOfficer()`

#### 5. Security Updates
- **SecurityConfig** (`src/main/java/com/ccts/config/SecurityConfig.java`):
  - Added `requestMatchers("/api/v1/files/**").hasAnyRole("USER", "OFFICER", "ADMIN")` for file upload endpoint
  - Added `requestMatchers("/uploads/evidence/**").permitAll()` to allow public access to uploaded images

### Frontend Changes

#### FileComplaint Page (`src/pages/FileComplaint.jsx`)
- **Geolocation**:
  - "Get My Location" button uses browser's Geolocation API
  - Captures latitude, longitude, and accuracy
  - Displays coordinates and accuracy
  - Stores location in form data

- **Camera Access**:
  - "Capture Photo" button activates device camera (prefers back camera on mobile)
  - Live video preview
  - Capture button to take photo
  - Cancel button to stop camera
  - Image preview after capture

- **File Upload**:
  - Alternative file input for uploading existing images
  - Validates file type (images only) and size (max 10MB)
  - Uploads image to `/api/v1/files/upload` endpoint
  - Receives file URL and includes in complaint submission

- **Form Submission**:
  - Uploads image first (if present) to get evidence URL
  - Includes geolocation data (latitude, longitude, accuracy) in complaint payload
  - Shows loading states and success/error messages
  - Resets form after successful submission

#### Service Updates (`src/services/complaintsService.js`)
- Added `uploadFile()` function to handle file uploads
- Existing `submitComplaint()` now expects geolocation fields in payload

## Database Migration
The geolocation fields will be automatically added to the `complaints` table by Hibernate's `ddl-auto: update` setting on next application startup.

## Configuration Required

### Backend (application.yml or environment variables)
```yaml
twilio:
  account-sid: ${TWILIO_ACCOUNT_SID:your_account_sid}
  auth-token: ${TWILIO_AUTH_TOKEN:your_auth_token}
  phone-number: ${TWILIO_PHONE_NUMBER:+1234567890}

sendgrid:
  api-key: ${SENDGRID_API_KEY:your_sendgrid_api_key}
  from-email: ${SENDGRID_FROM_EMAIL:noreply@civicwatch.com}
  from-name: ${SENDGRID_FROM_NAME:CivicWatch}

notification:
  admin-email: ${ADMIN_EMAIL:admin@civicwatch.com}
  admin-phone: ${ADMIN_PHONE:+1234567890}
  send-on-complaint-submit: true
  send-on-status-update: true
  send-on-assignment: true
```

### Environment Variables (Recommended for Production)
Set the following environment variables instead of hardcoding in application.yml:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_FROM_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PHONE`

## Testing

### Manual Testing Steps

1. **Geolocation & Camera**:
   - Log in as a user
   - Navigate to "File a Complaint" page
   - Click "Get My Location" - should prompt for location permission and display coordinates
   - Click "Capture Photo" - should prompt for camera permission and show video preview
   - Take a photo and verify it appears in preview
   - Submit form and verify complaint is created with location data and evidence URL

2. **File Upload**:
   - Use "Or upload existing image" option to select an image file
   - Verify file size validation (try uploading >10MB file)
   - Verify file type validation (try uploading non-image)
   - Submit and verify evidence URL is stored

3. **Notifications**:
   - Submit a new complaint (check admin email and phone for notification)
   - As admin, update complaint status (check for notification)
   - As admin, assign complaint to officer (check for notification)
   - Verify notifications contain correct complaint details and tracking number

4. **Admin Dashboard**:
   - Verify complaints list shows new complaints
   - Verify evidence images are accessible via URL
   - Test status updates and assignments

### API Testing with cURL

**Upload file:**
```bash
curl -X POST http://localhost:8080/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

**Submit complaint with geolocation:**
```bash
curl -X POST http://localhost:8080/api/v1/complaints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Complaint",
    "description": "Test description with geolocation",
    "category": "Licensing",
    "location": "123 Main St",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "accuracy": 10.5,
    "evidenceUrl": "/uploads/evidence/abc123.jpg"
  }'
```

## Notes

- **Push Notifications**: Currently implemented as placeholder logging. To implement real push notifications, consider:
  - Firebase Cloud Messaging (FCM) for web/mobile
  - Twilio Notify for multi-channel
  - Web Push API for browser notifications

- **Security**: File upload endpoint requires authentication. Uploaded files are served from a public directory without authentication - consider adding access controls if files contain sensitive data.

- **Error Handling**: Notification service gracefully handles missing API keys by logging to console instead of failing.

- **Scalability**: For production with high volume, consider:
  - Asynchronous notification sending (using @Async or message queues)
  - File storage in cloud (S3, Azure Blob, etc.) instead of local filesystem
  - Rate limiting for SMS/email to avoid costs

## Future Enhancements

1. Display geolocation on map in admin dashboard
2. Allow manual location entry as fallback
3. Multiple file uploads per complaint
4. Push notification implementation
5. Notification preferences for users
6. Notification history/logging in database
7. SMS/email templates with HTML formatting
8. Two-way SMS communication (reply handling)
