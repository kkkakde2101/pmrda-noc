# PMRDA Tree NOC Portal — User Manual

**Version:** 1.0  
**Date:** October 2026  
**Application:** PMRDA Tree No-Objection Certificate (NOC) Online Portal  
**Developed by:** Krios IT Services

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Getting Started — Login](#3-getting-started--login)
4. [Applicant Guide](#4-applicant-guide)
5. [Assistant (Clerk) Guide](#5-assistant-clerk-guide)
6. [Superintendent Guide](#6-superintendent-guide)
7. [Head of Department (HoD / Authority) Guide](#7-head-of-department-hod--authority-guide)
8. [Super Admin Guide](#8-super-admin-guide)
9. [Application Status Reference](#9-application-status-reference)
10. [Payment Guide](#10-payment-guide)
11. [Document Requirements](#11-document-requirements)
12. [Frequently Asked Questions](#12-frequently-asked-questions)
13. [Deployment & Technical Notes](#13-deployment--technical-notes)

---

## 1. Introduction

The **PMRDA Tree NOC Portal** is an online system for applying, tracking, and approving Tree No-Objection Certificates issued by the Pune Metropolitan Region Development Authority (PMRDA) under the Maharashtra (Urban Areas) Protection and Preservation of Trees Act, 1975.

### 1.1 Purpose

Any person or organisation intending to cut, transplant, or uproot trees on their plot/site within PMRDA jurisdiction must obtain a Tree NOC before commencing construction or any site development activity. This portal replaces the manual paper-based process with a fully online workflow.

### 1.2 Types of NOC

| Type | When Required |
|------|---------------|
| **Provisional NOC** | Before construction begins — required along with the building permit application |
| **Final NOC** | After construction — required to obtain the Occupancy Certificate (OC) |

### 1.3 User Roles

| Role | Description |
|------|-------------|
| **Applicant** | Property owner or authorised representative who files the application |
| **Assistant / Clerk** | First-level staff who receives and registers the application |
| **Superintendent** | Senior staff who reviews and inspects applications |
| **HoD / Authority** | Head of Department who gives the final Approve / Reject decision |
| **Super Admin** | System administrator who manages users and system settings |

---

## 2. System Requirements

| Item | Requirement |
|------|-------------|
| Browser | Google Chrome 110+, Mozilla Firefox 110+, Microsoft Edge 110+ |
| Internet | Stable broadband connection (minimum 2 Mbps) |
| Screen | Minimum 1024 × 768 resolution |
| Documents | PDF format, each file not exceeding 5 MB |
| JavaScript | Must be enabled in the browser |

> **Mobile:** The portal is responsive and works on modern Android and iOS browsers, but a desktop/laptop is recommended for filling the application form.

---

## 3. Getting Started — Login

### 3.1 Accessing the Portal

Open your browser and navigate to the portal URL provided by PMRDA (e.g., `https://noc.pmrda.gov.in`).

### 3.2 Logging In

1. Enter your **Username** and **Password**.
2. Click **Login**.
3. On success you are redirected to your role-specific **Dashboard**.

### 3.3 Demo / Test Credentials

For testing and demonstration the following accounts are available:

| Username | Role | Password |
|----------|------|----------|
| `applicant` | Applicant | `Password@123` |
| `assistant` | Assistant / Clerk | `Password@123` |
| `superintendent` | Superintendent | `Password@123` |
| `hod` | HoD / Authority | `Password@123` |
| `admin` | Super Admin | `Password@123` |

> These accounts are for **demo use only** and should be removed or have passwords changed before going live.

### 3.4 Forgot Password

Contact your PMRDA system administrator to reset your password.

---

## 4. Applicant Guide

### 4.1 Dashboard Overview

After login, the Applicant dashboard shows:

- **Summary cards** — total applications, pending, approved, rejected counts
- **Recent applications** table with current status
- **New Application** button

### 4.2 Submitting a New Application

Click **New Application** on the dashboard. The form has **6 steps**:

---

#### Step 1 — Applicant Details

Fill in all mandatory fields (marked with `*`):

| Field | Description |
|-------|-------------|
| Applicant Name | Full name of the property owner / applicant |
| Applicant Address | Complete postal address |
| Contact Number | 10-digit mobile number |
| Email Address | Valid email ID |
| Application Type | Select **Provisional** or **Final** |
| Plot / Survey Number | Survey or CTS number of the plot |
| Village / Locality | Village or locality name |
| Zone | PMRDA zone / ward |
| Total Plot Area (sq.m) | Numeric value |

Click **Next** to proceed.

---

#### Step 2 — Site Details

| Field | Description |
|-------|-------------|
| Site Address | Complete address of the site/plot |
| Development Purpose | e.g., Residential Building, Commercial Complex |
| Architect / Engineer Name | Name of the project architect or licensed engineer |
| Architect / Engineer Registration No. | Registration number |

Click **Next** to proceed.

---

#### Step 3 — Tree Inventory

This step lists all trees on the plot that are proposed to be **cut**, **transplanted**, or **retained**.

**Adding a tree:**
1. Click **Add Tree**.
2. Fill in — Common Name, Botanical Name, Girth (cm), Height (m), Canopy Spread (m), Age (years), Condition, and Action (Cut / Transplant / Retain).
3. Click the **Save** (✓) icon.
4. Repeat for each tree.

**Editing a tree:**  
Click the pencil icon on any row. Make changes, then click Save.

**Removing a tree:**  
Click the delete icon on the row, then confirm.

> At least one tree must be added before proceeding.

Click **Next** to proceed.

---

#### Step 4 — Undertaking

Read the undertaking declaration carefully. It states that the information provided is true and that the applicant agrees to comply with all conditions of the NOC.

Tick the checkbox **I agree to the above undertaking** and click **Next**.

---

#### Step 5 — Document Upload

Upload the following mandatory documents in **PDF format** (max 5 MB each):

| Document | Description |
|----------|-------------|
| Property Card / 7/12 Extract | Proof of ownership |
| Site Plan | Approved or proposed site plan drawn to scale |
| Tree Survey Report | Survey report by a registered horticulturist / arborist |
| Index Map | Location map showing the plot |
| Authorization Letter *(if applicable)* | If applicant is not the owner |

Click **Choose File**, select the PDF, then click **Upload**. A green tick confirms the upload.

Click **Next** to proceed.

---

#### Step 6 — Payment & Submit

The system calculates the fee based on the number and type of trees:

| Action | Fee per Tree |
|--------|-------------|
| Cutting | ₹ 500 |
| Transplanting | ₹ 200 |
| No fee for Retain | — |

1. Review the **fee summary**.
2. Click **Proceed to Payment**.
3. The payment gateway opens — choose UPI, Net Banking, Credit/Debit Card, or Wallet.
4. Complete the payment.
5. On payment success, the application is **automatically submitted**.

A **Reference Number** is displayed. Note it for future tracking.

---

### 4.3 Tracking Your Application

From the dashboard click any application or go to **My Applications**.

Each application shows:
- Reference Number
- Application Type
- Date Submitted
- Current Status (see [Section 9](#9-application-status-reference))
- Remarks / notes from staff (if any)

### 4.4 Downloading the NOC Certificate

When your application reaches **Approved** status:

1. Open the application from **My Applications**.
2. Click **Download NOC Certificate**.
3. The PDF certificate is generated and downloaded.

> The certificate carries a unique QR code that can be used for offline verification.

---

## 5. Assistant (Clerk) Guide

The Assistant is the **first point of contact** for submitted applications. Their role is to scrutinise the application for completeness and register it for further review.

### 5.1 Dashboard

The Assistant dashboard shows:
- Pending applications awaiting action
- Applications under scrutiny
- Recently processed applications

### 5.2 Reviewing a Submitted Application

1. Click the application in the **Pending** list.
2. The **Application Detail** page opens.

**Tabs on the detail page:**
- **Details** — applicant and site information
- **Tree Inventory** — list of trees
- **Documents** — uploaded PDFs (click to view/download)
- **Payment** — payment confirmation and receipt
- **Timeline** — full status history

### 5.3 Scrutiny Checklist

Verify the following before forwarding:

- [ ] All mandatory fields are filled correctly
- [ ] Plot/Survey number is valid and matches property card
- [ ] Tree inventory is complete (girth, height, canopy for each tree)
- [ ] All required documents are uploaded and legible
- [ ] Payment has been received and matches the calculated fee
- [ ] Undertaking is signed / agreed

### 5.4 Forwarding or Rejecting

**To forward:**
1. Add your **Remarks** in the remarks box (optional but recommended).
2. Click **Register & Forward to Scrutiny**.
3. Status changes to **Under Scrutiny**.

**To reject (incomplete application):**
1. Add your **Remarks** explaining what is missing.
2. Click **Reject**.
3. Status changes to **Rejected** and the applicant is notified.

---

## 6. Superintendent Guide

The Superintendent performs a **detailed technical review** and may conduct a **site inspection**.

### 6.1 Queue

The Superintendent dashboard shows applications with status **Under Scrutiny** assigned to them.

### 6.2 Technical Review

Open the application and verify:
- Tree inventory accuracy (girth, health, species)
- Appropriateness of proposed actions (cut / transplant / retain)
- Whether compensatory plantation is required
- Site plan vs. tree locations

### 6.3 Submitting an Inspection Report

1. Click **Inspection Report** tab or the **Add Inspection Report** button.
2. Fill in:
   - Date of inspection
   - Observations for each tree (verified girth, condition, remarks)
   - Overall recommendation (Recommend Approval / Recommend Rejection)
   - Any conditions to be imposed
3. Click **Submit Inspection Report**.
4. Status changes to **Inspection Report Submitted**.

### 6.4 Forwarding for Final Decision

After the inspection report is submitted:
1. Review the report summary.
2. Add final remarks.
3. Click **Forward for Review** — the application moves to the HoD queue.

---

## 7. Head of Department (HoD / Authority) Guide

The HoD gives the **final decision** — Approve or Reject.

### 7.1 Queue

The HoD dashboard shows applications with status **Pending Decision**.

### 7.2 Reviewing for Decision

Open the application. Review:
- Applicant details and site information
- Tree inventory
- Inspection report submitted by the Superintendent
- All uploaded documents

### 7.3 Approving

1. Optionally add **Conditions** to be printed on the NOC certificate.
2. Add **Remarks**.
3. Click **Approve**.
4. Status changes to **Approved**.
5. The system generates the **NOC Certificate PDF** automatically.
6. The applicant is notified and can download the certificate.

### 7.4 Rejecting

1. Add **Remarks** clearly stating the reason for rejection.
2. Click **Reject**.
3. Status changes to **Rejected**.
4. The applicant is notified with the rejection reason.

> Rejected applications cannot be reactivated. The applicant must file a new application.

---

## 8. Super Admin Guide

The Super Admin manages users, roles, and system configuration.

### 8.1 User Management

Navigate to **Admin → Users**.

**Adding a new user:**
1. Click **Add User**.
2. Fill in: Full Name, Username, Email, Role, and Password.
3. Click **Save**.

**Editing a user:**
Click the edit icon on the user row, update the fields, click **Save**.

**Deactivating a user:**
Toggle the **Active** switch to off. The user cannot log in while inactive.

### 8.2 Role Assignment

Each user is assigned exactly one role:

| Role Value | Access Level |
|------------|-------------|
| `Applicant` | Can only file and track their own applications |
| `Assistant` | Sees all submitted applications; can forward/reject |
| `Superintendent` | Sees applications under scrutiny; does inspections |
| `HoD` | Sees all applications in the final review queue; approves/rejects |
| `SuperAdmin` | Full access including user management |

### 8.3 Reports (if enabled)

The Admin section may include summary reports:
- Applications by status
- Applications by month
- Fee collection summary

---

## 9. Application Status Reference

| Status | Meaning |
|--------|---------|
| **Draft** | Applicant started the form but has not submitted |
| **Submitted** | Applicant submitted and payment received; waiting for Assistant |
| **Under Scrutiny** | Assistant forwarded; Superintendent is reviewing |
| **Under Inspection** | Superintendent is conducting site inspection |
| **Inspection Report Submitted** | Inspection report filed; waiting to forward to HoD |
| **Under Review** | HoD has received the application |
| **Pending Decision** | HoD is about to give the final decision |
| **Approved** | NOC granted — certificate is ready to download |
| **Rejected** | Application rejected — reason in remarks |

---

## 10. Payment Guide

### 10.1 Fee Calculation

| Tree Action | Fee |
|-------------|-----|
| Cutting | ₹ 500 per tree |
| Transplanting | ₹ 200 per tree |
| Retention | No fee |

*Example: 3 trees to cut + 2 trees to transplant = ₹ 1,500 + ₹ 400 = **₹ 1,900 total***

### 10.2 Supported Payment Methods

- UPI (Google Pay, PhonePe, Paytm, BHIM)
- Net Banking (all major banks)
- Credit Card / Debit Card (Visa, Mastercard, RuPay)
- Mobile Wallets

### 10.3 Payment Receipt

After successful payment, a receipt is shown on-screen. The receipt is also available under the **Payment** tab of your application at any time.

### 10.4 Refund Policy

Fees are non-refundable once payment is made. If the application is rejected, no refund is issued. Contact PMRDA office for exceptional cases.

---

## 11. Document Requirements

| Document | Format | Max Size | Mandatory |
|----------|--------|----------|-----------|
| Property Card / 7/12 Extract | PDF | 5 MB | Yes |
| Site Plan (to scale) | PDF | 5 MB | Yes |
| Tree Survey Report | PDF | 5 MB | Yes |
| Index / Location Map | PDF | 5 MB | Yes |
| Authorization Letter | PDF | 5 MB | Only if applicant ≠ owner |
| Previous NOC (for Final NOC) | PDF | 5 MB | Only for Final NOC |

**Tips for uploading:**
- Scan documents at 150–200 DPI for a good quality / small size balance.
- Ensure documents are clearly legible — blurry or cut-off scans will be rejected.
- All documents must be in **PDF format** only.

---

## 12. Frequently Asked Questions

**Q: I submitted the form but did not get a reference number. What should I do?**  
A: Check the **My Applications** page. If no application appears and payment was deducted, contact PMRDA with your payment transaction ID.

**Q: I made a mistake in the form after submitting. Can I edit it?**  
A: After submission, the form cannot be edited. Contact PMRDA office with your reference number. An Assistant can reject the application with a note; you can then file a new, corrected application.

**Q: How long does the process take?**  
A: Typically 15–30 working days from submission, subject to inspection scheduling and workload.

**Q: My application has been in "Under Scrutiny" for a long time. Who should I contact?**  
A: Note your reference number and contact the PMRDA Tree Department office in person or by phone.

**Q: Can I apply for both Provisional and Final NOC in the same application?**  
A: No. Each NOC type requires a separate application.

**Q: How do I verify the authenticity of a NOC certificate?**  
A: Scan the QR code on the certificate using any QR scanner app. It will display the application details from the PMRDA portal.

---

## 13. Deployment & Technical Notes

> This section is for system administrators and IT staff.

### 13.1 Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Angular 22 (standalone components, signals) |
| Backend API | .NET 10 Web API + Entity Framework Core 10 |
| Database | Microsoft SQL Server 2019+ |
| Authentication | JWT Bearer (8-hour expiry) |
| File Storage | Local filesystem (`wwwroot/uploads/`) |

### 13.2 Deployment

1. **Database:** Run `PMRDA_NOC_Database.sql` against the target SQL Server instance.
   - For **OwBarcodeUAT** or an existing database, replace the top `CREATE DATABASE` and `USE PMRDA_NOC` lines with `USE <your_database_name>;`.
2. **API + Frontend:** Copy the entire `deploy/` folder to the server.
3. **Connection string:** Edit `deploy/appsettings.json` — update `ConnectionStrings.Default` with your SQL Server host, database name, username and password.
4. **Start the API:** `dotnet PMRDA.Api.dll` (or configure as a Windows Service / IIS application).
5. **Browse** to `http://<server-ip>:<port>` — the .NET API serves the Angular frontend from `wwwroot/`.

### 13.3 Environment Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "Default": "Server=<HOST>;Database=<DB>;User Id=<USER>;Password=<PASSWORD>;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "<change-this-to-a-long-random-secret>",
    "Issuer": "pmrda-api",
    "Audience": "pmrda-web",
    "ExpiryHours": 8
  }
}
```

> **Security:** Change the JWT key before going live. Never commit `appsettings.json` with real credentials to source control.

### 13.4 Default Admin Account

The database seed script creates the following administrator account:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `Password@123` | SuperAdmin |

**Change this password immediately** after the first login in the production environment.

---

*For support, contact the PMRDA IT helpdesk or Krios IT Services.*
