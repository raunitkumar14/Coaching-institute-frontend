Mentors Eduserv — Frontend Spec

Kylas CRM Lead Flow Update


Paste this file into Claude Code and say:
"Read this spec, make a plan, and execute it step by step."




Overview

Update the frontend to replace manual student form fields with Kylas CRM lead fetch flow.
Counselor enters a Lead ID → system fetches student details from backend → recording starts.


Changes Required

1. pages/conversation/new.tsx — Complete Redesign

Remove all existing student form fields (name, phone, email).

New flow:


Show a single "Lead ID" input field (numeric, 8 digits)
Show a "Fetch Lead" button next to it
When "Fetch Lead" is clicked:

Call GET /api/leads/{lead_id} from our backend
Show loading spinner while fetching
On success: show student name and phone in a read-only card below
On error: show "Lead not found. Please check the Lead ID."



Recording section appears ONLY after lead is successfully fetched
Start Recording button disabled until lead is fetched
After stop recording and S3 upload:

Call POST /api/conversations with {lead_id, s3_key, duration_seconds}
Redirect to /conversation/{session_id}






2. components/AudioRecorder.tsx — Update Props

Change props from {student_name, student_phone, student_email} to:


lead_id: string
student_name: string
student_phone: string


Update upload flow:


POST /api/conversations/upload-url with {lead_id, student_name, student_phone}
Rest of S3 upload flow remains same



3. pages/dashboard.tsx — Update Display

Change conversation cards to show:


Student Name (bold)
Lead ID (with label "Lead ID:")
Phone number
Date and duration
Status badge



4. pages/conversation/[id].tsx — Simplify

Remove:


TranscriptPanel
SummaryPanel
Any transcript/summary related UI


Keep:


Student name, Lead ID, phone
Audio player
Status badge (only: recording, uploading, uploaded, error)
Duration and date



5. components/ConversationCard.tsx — Update

Show:


Student name
Lead ID (with label)
Phone
Date, duration
Status badge



Design Guidelines


Keep existing orange Mentors Eduserv theme (#E8450A)
Navy color: #1a1a2e
Professional and clean
All existing orange colors stay same



After All Changes

Run:

bashgit add .
git commit -m "Update frontend for Kylas CRM lead flow"
git push origin main


Success Criteria


 Lead ID input works
 Fetch Lead calls backend API
 Student details show after fetch
 Recording starts only after lead fetch
 Audio uploads to S3
 Conversation saved in MongoDB
 Dashboard shows Lead ID
 Detail page shows Lead ID
 No transcript/summary UI anywhere