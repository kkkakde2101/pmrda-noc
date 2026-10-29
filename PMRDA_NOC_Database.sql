-- =============================================================================
-- PMRDA Tree NOC Portal — SQL Server Database Setup Script
-- Run this on your SQL Server instance to create the database + seed data
-- Compatible with: SQL Server 2019 / 2022 / Azure SQL
-- =============================================================================

USE master;
GO

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'PMRDA_NOC')
BEGIN
    CREATE DATABASE PMRDA_NOC;
END
GO

USE PMRDA_NOC;
GO

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
CREATE TABLE Users (
    Id              INT             IDENTITY(1,1)   PRIMARY KEY,
    LoginName       NVARCHAR(50)    NOT NULL,
    PasswordHash    NVARCHAR(200)   NOT NULL,
    FirstName       NVARCHAR(100)   NOT NULL,
    LastName        NVARCHAR(100)   NOT NULL,
    Email           NVARCHAR(200)   NOT NULL,
    Mobile          NVARCHAR(15)    NULL,
    Role            INT             NOT NULL,   -- 0=Applicant 1=Assistant 2=Superintendent 3=Authority 4=SuperAdmin
    IsActive        BIT             NOT NULL    DEFAULT 1,
    MustChangePassword BIT          NOT NULL    DEFAULT 0,
    CreatedAt       DATETIME2       NOT NULL    DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_Users_LoginName UNIQUE (LoginName)
);
GO

-- Applications
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Applications')
CREATE TABLE Applications (
    Id                              INT             IDENTITY(1,1)   PRIMARY KEY,
    ApplicationNumber               NVARCHAR(50)    NOT NULL,
    NocType                         INT             NOT NULL,   -- 0=Provisional 1=Final
    Status                          INT             NOT NULL    DEFAULT 0,
    ApplicantUserId                 INT             NOT NULL    REFERENCES Users(Id),
    ApplicantName                   NVARCHAR(200)   NOT NULL,
    ApplicantAddress                NVARCHAR(500)   NOT NULL    DEFAULT '',
    MobileNumber                    NVARCHAR(15)    NOT NULL,
    Age                             INT             NULL,
    Occupation                      NVARCHAR(100)   NULL,
    AuthorisedSignatory             NVARCHAR(200)   NULL,
    SurveyNumber                    NVARCHAR(50)    NOT NULL,
    GatNumber                       NVARCHAR(50)    NULL,
    PlotNumber                      NVARCHAR(50)    NULL,
    Village                         NVARCHAR(100)   NOT NULL,
    Taluka                          NVARCHAR(100)   NOT NULL,
    District                        NVARCHAR(100)   NOT NULL    DEFAULT 'Pune',
    PlotAreaSqm                     DECIMAL(10,2)   NOT NULL    DEFAULT 0,
    GoogleCoordinates               NVARCHAR(100)   NULL,
    GoogleCoordinatesLast5Years     NVARCHAR(200)   NULL,
    ExistingTreeCount               INT             NOT NULL    DEFAULT 0,
    RequiredPlantationCount         INT             NOT NULL    DEFAULT 0,
    ProposedPlantationList          NVARCHAR(MAX)   NULL,
    HasNoPriorTreeCuttingPermission BIT             NOT NULL    DEFAULT 1,
    CommencementCertificateAttached BIT             NOT NULL    DEFAULT 0,
    ProvisionalNocObtained          BIT             NULL,
    ProvisionalNocNumber            NVARCHAR(50)    NULL,
    TreeCuttingNocObtained          BIT             NULL,
    TreeCuttingNocDetails           NVARCHAR(500)   NULL,
    PreviouslyExistingTrees         INT             NULL,
    NewlyPlantedTrees               INT             NULL,
    UndertakingSigned               BIT             NOT NULL    DEFAULT 0,
    UndertakingDate                 DATE            NULL,
    ChallanNumber                   NVARCHAR(50)    NULL,
    ChallanAmount                   DECIMAL(10,2)   NULL,
    ChallanDate                     DATE            NULL,
    ChallanAttached                 BIT             NOT NULL    DEFAULT 0,
    CurrentRemarks                  NVARCHAR(2000)  NULL,
    CreatedAt                       DATETIME2       NOT NULL    DEFAULT GETUTCDATE(),
    UpdatedAt                       DATETIME2       NOT NULL    DEFAULT GETUTCDATE(),
    SubmittedAt                     DATETIME2       NULL,
    CONSTRAINT UQ_Applications_ApplicationNumber UNIQUE (ApplicationNumber)
);
GO

-- Tree Inventory
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TreeInventory')
CREATE TABLE TreeInventory (
    Id              INT             IDENTITY(1,1)   PRIMARY KEY,
    ApplicationId   INT             NOT NULL        REFERENCES Applications(Id) ON DELETE CASCADE,
    TreeNumber      NVARCHAR(20)    NOT NULL,
    CommonName      NVARCHAR(100)   NOT NULL,
    ScientificName  NVARCHAR(150)   NOT NULL,
    AgeYears        INT             NULL,
    HeightMetres    DECIMAL(5,2)    NULL,
    GirthMetres     DECIMAL(5,2)    NULL,
    Latitude        DECIMAL(9,6)    NULL,
    Longitude       DECIMAL(9,6)    NULL,
    Remarks         NVARCHAR(500)   NULL
);
GO

-- Documents
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Documents')
CREATE TABLE Documents (
    Id                  INT             IDENTITY(1,1)   PRIMARY KEY,
    ApplicationId       INT             NOT NULL        REFERENCES Applications(Id) ON DELETE CASCADE,
    ChecklistItemNumber INT             NOT NULL,
    Label               NVARCHAR(300)   NOT NULL,
    FileName            NVARCHAR(255)   NOT NULL,
    StoragePath         NVARCHAR(500)   NOT NULL,
    FileSize            BIGINT          NOT NULL        DEFAULT 0,
    UploadedAt          DATETIME2       NOT NULL        DEFAULT GETUTCDATE()
);
GO

-- Workflow History
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkflowHistory')
CREATE TABLE WorkflowHistory (
    Id                  INT             IDENTITY(1,1)   PRIMARY KEY,
    ApplicationId       INT             NOT NULL        REFERENCES Applications(Id) ON DELETE CASCADE,
    Action              NVARCHAR(100)   NOT NULL,
    FromStatus          INT             NOT NULL,
    ToStatus            INT             NOT NULL,
    Remarks             NVARCHAR(2000)  NULL,
    PerformedByUserId   INT             NOT NULL        REFERENCES Users(Id),
    PerformedAt         DATETIME2       NOT NULL        DEFAULT GETUTCDATE()
);
GO

-- Inspection Reports
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InspectionReports')
CREATE TABLE InspectionReports (
    Id                          INT             IDENTITY(1,1)   PRIMARY KEY,
    ApplicationId               INT             NOT NULL        REFERENCES Applications(Id) ON DELETE CASCADE,
    InspectorName               NVARCHAR(200)   NOT NULL,
    InspectionDate              DATE            NOT NULL,
    TotalTreesOnSite            INT             NOT NULL        DEFAULT 0,
    TotalPlotArea               DECIMAL(10,2)   NOT NULL        DEFAULT 0,
    TreesVerified               BIT             NOT NULL        DEFAULT 0,
    RecommendedPlantationCount  INT             NOT NULL        DEFAULT 0,
    Findings                    NVARCHAR(4000)  NOT NULL,
    Remarks                     NVARCHAR(2000)  NULL,
    GeotaggingReport            NVARCHAR(500)   NULL,
    SubmittedAt                 DATETIME2       NOT NULL        DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_InspectionReports_ApplicationId UNIQUE (ApplicationId)
);
GO

-- =============================================================================
-- SEED DATA — Demo users
-- Passwords are BCrypt hashes of "Password@123"
-- =============================================================================

IF NOT EXISTS (SELECT 1 FROM Users WHERE LoginName = 'applicant')
INSERT INTO Users (LoginName, PasswordHash, FirstName, LastName, Email, Mobile, Role, IsActive, MustChangePassword, CreatedAt)
VALUES
-- Role: 0=Applicant 1=Assistant 2=Superintendent 3=Authority 4=SuperAdmin
('applicant',      '$2a$11$rOCzqJtKvEL7dN1RgSJxMuBGdQoQ9LHGRd3NfYlH/wJv2pS7z8uXm', 'Rajesh',  'Patil',     'rajesh@example.com',    '9876543210', 0, 1, 0, GETUTCDATE()),
('assistant',      '$2a$11$rOCzqJtKvEL7dN1RgSJxMuBGdQoQ9LHGRd3NfYlH/wJv2pS7z8uXm', 'Savita',  'Jadhav',    'savita@pmrda.gov.in',    '9823000111', 1, 1, 0, GETUTCDATE()),
('superintendent', '$2a$11$rOCzqJtKvEL7dN1RgSJxMuBGdQoQ9LHGRd3NfYlH/wJv2pS7z8uXm', 'Ganesh',  'More',      'ganesh@pmrda.gov.in',    '9823000222', 2, 1, 0, GETUTCDATE()),
('hod',            '$2a$11$rOCzqJtKvEL7dN1RgSJxMuBGdQoQ9LHGRd3NfYlH/wJv2pS7z8uXm', 'Anand',   'Jagtap',    'anand@pmrda.gov.in',     '9823000333', 3, 1, 0, GETUTCDATE()),
('admin',          '$2a$11$rOCzqJtKvEL7dN1RgSJxMuBGdQoQ9LHGRd3NfYlH/wJv2pS7z8uXm', 'Super',   'Admin',     'admin@pmrda.gov.in',     '9823000000', 4, 1, 0, GETUTCDATE());
GO

-- =============================================================================
-- SEED DATA — Demo Applications
-- =============================================================================

DECLARE @applicantId INT = (SELECT Id FROM Users WHERE LoginName = 'applicant');
DECLARE @assistantId INT = (SELECT Id FROM Users WHERE LoginName = 'assistant');
DECLARE @hodId       INT = (SELECT Id FROM Users WHERE LoginName = 'hod');

-- Application 1: Under Scrutiny (NocType=0=Provisional, Status=2=UnderScrutiny)
IF NOT EXISTS (SELECT 1 FROM Applications WHERE ApplicationNumber = 'PMRDA/TNOC/PROV/2026/0041')
BEGIN
    INSERT INTO Applications
        (ApplicationNumber, NocType, Status, ApplicantUserId, ApplicantName, ApplicantAddress,
         MobileNumber, Age, Occupation, SurveyNumber, GatNumber, PlotNumber, Village, Taluka, District,
         PlotAreaSqm, GoogleCoordinates, ExistingTreeCount, RequiredPlantationCount,
         HasNoPriorTreeCuttingPermission, CommencementCertificateAttached,
         GoogleCoordinatesLast5Years, UndertakingSigned, UndertakingDate,
         ChallanAttached, ChallanNumber, ChallanAmount, ChallanDate,
         CreatedAt, UpdatedAt, SubmittedAt)
    VALUES
        ('PMRDA/TNOC/PROV/2026/0041', 0, 2, @applicantId,
         'Rajesh Patil', 'Flat 201, Shivam Residency, Wakad, Pune 411057',
         '9876543210', 42, 'Builder', '123/1', '123', 'Plot A', 'Wadgaon Sheri', 'Haveli', 'Pune',
         4500, '18.5204°N, 73.8567°E', 3, 57,
         1, 1, 'Available — submitted with application',
         1, '2026-10-14',
         1, 'CHN/2026/8821', 5000, '2026-10-14',
         '2026-10-14T12:00:00', '2026-10-16T09:15:00', '2026-10-15T10:30:00');

    DECLARE @app1Id INT = SCOPE_IDENTITY();

    INSERT INTO TreeInventory (ApplicationId, TreeNumber, CommonName, ScientificName, AgeYears, HeightMetres, GirthMetres, Latitude, Longitude)
    VALUES
        (@app1Id, 'T-01', 'Banyan', 'Ficus benghalensis',     15, 8.5, 1.20, 18.520400, 73.856700),
        (@app1Id, 'T-02', 'Neem',   'Azadirachta indica',     10, 6.0, 0.85, 18.520600, 73.856900),
        (@app1Id, 'T-03', 'Mango',  'Mangifera indica',       20, 9.0, 1.50, 18.520800, 73.857100);

    INSERT INTO Documents (ApplicationId, ChecklistItemNumber, Label, FileName, StoragePath, FileSize, UploadedAt)
    VALUES
        (@app1Id, 1,  'Application letter',           'application_letter.pdf', 'uploads/app1/application_letter.pdf',  245000, '2026-10-14T14:00:00'),
        (@app1Id, 2,  'Land ownership documents',     'ownership_docs.pdf',     'uploads/app1/ownership_docs.pdf',     1240000, '2026-10-14T14:05:00'),
        (@app1Id, 3,  'Master layout and landscape plan', 'layout_plan.pdf',    'uploads/app1/layout_plan.pdf',        3500000, '2026-10-14T14:10:00'),
        (@app1Id, 5,  'Tree survey report',           'tree_survey.pdf',        'uploads/app1/tree_survey.pdf',        2100000, '2026-10-14T14:15:00'),
        (@app1Id, 14, 'Deposit challan',              'challan.pdf',            'uploads/app1/challan.pdf',             180000, '2026-10-14T14:20:00');

    INSERT INTO WorkflowHistory (ApplicationId, Action, FromStatus, ToStatus, Remarks, PerformedByUserId, PerformedAt)
    VALUES
        (@app1Id, 'Application Submitted', 0, 1, NULL,                              @applicantId, '2026-10-15T10:30:00'),
        (@app1Id, 'Inward Registered',     1, 2, 'Registered. Ref: PMRDA/NOC/2026/0042', @assistantId, '2026-10-16T09:15:00');
END
GO

DECLARE @applicantId INT = (SELECT Id FROM Users WHERE LoginName = 'applicant');
DECLARE @assistantId INT = (SELECT Id FROM Users WHERE LoginName = 'assistant');
DECLARE @hodId       INT = (SELECT Id FROM Users WHERE LoginName = 'hod');
DECLARE @superId     INT = (SELECT Id FROM Users WHERE LoginName = 'superintendent');

-- Application 2: Approved (NocType=1=Final, Status=9=Approved)
IF NOT EXISTS (SELECT 1 FROM Applications WHERE ApplicationNumber = 'PMRDA/TNOC/FINAL/2026/0028')
BEGIN
    INSERT INTO Applications
        (ApplicationNumber, NocType, Status, ApplicantUserId, ApplicantName, ApplicantAddress,
         MobileNumber, Age, Occupation, SurveyNumber, GatNumber, Village, Taluka, District,
         PlotAreaSqm, GoogleCoordinates, ExistingTreeCount, RequiredPlantationCount,
         HasNoPriorTreeCuttingPermission, CommencementCertificateAttached,
         ProvisionalNocObtained, ProvisionalNocNumber, TreeCuttingNocObtained, PreviouslyExistingTrees, NewlyPlantedTrees,
         UndertakingSigned, UndertakingDate,
         ChallanAttached, ChallanNumber, ChallanAmount,
         CreatedAt, UpdatedAt, SubmittedAt)
    VALUES
        ('PMRDA/TNOC/FINAL/2026/0028', 1, 9, @applicantId,
         'Sunita Deshpande', 'Plot 15, Sector 7, Koregaon Park, Pune 411001',
         '9823456780', 38, 'Developer', '45/2', '45', 'Uruli Kanchan', 'Purandar', 'Pune',
         2400, '18.4623°N, 74.0513°E', 2, 30,
         1, 1, 1, 'PMRDA/TNOC/PROV/2025/0015', 0, 2, 30,
         1, '2026-09-01',
         1, 'CHN/2026/7701', 3000,
         '2026-09-01T09:00:00', '2026-09-25T10:00:00', '2026-09-02T10:00:00');

    DECLARE @app2Id INT = SCOPE_IDENTITY();

    INSERT INTO WorkflowHistory (ApplicationId, Action, FromStatus, ToStatus, Remarks, PerformedByUserId, PerformedAt)
    VALUES
        (@app2Id, 'Application Submitted',       0, 1, NULL,                                              @applicantId, '2026-09-02T10:00:00'),
        (@app2Id, 'Inward Registered',           1, 2, 'Registered.',                                     @assistantId, '2026-09-05T09:00:00'),
        (@app2Id, 'Forwarded for Inspection',    2, 3, NULL,                                              @assistantId, '2026-09-10T11:00:00'),
        (@app2Id, 'Inspection Report Submitted', 3, 5, 'All 30 trees verified. Native varieties. Geotagging done.', @superId, '2026-09-18T15:30:00'),
        (@app2Id, 'NOC Approved',                7, 9, 'All conditions satisfied. NOC granted.',          @hodId,       '2026-09-25T10:00:00');
END
GO

DECLARE @applicantId INT = (SELECT Id FROM Users WHERE LoginName = 'applicant');
DECLARE @assistantId INT = (SELECT Id FROM Users WHERE LoginName = 'assistant');

-- Application 3: Returned for Correction (NocType=0=Provisional, Status=3=ReturnedForCorrection)
IF NOT EXISTS (SELECT 1 FROM Applications WHERE ApplicationNumber = 'PMRDA/TNOC/PROV/2026/0038')
BEGIN
    INSERT INTO Applications
        (ApplicationNumber, NocType, Status, ApplicantUserId, ApplicantName, ApplicantAddress,
         MobileNumber, Age, Occupation, SurveyNumber, Village, Taluka, District,
         PlotAreaSqm, GoogleCoordinates, ExistingTreeCount, RequiredPlantationCount,
         HasNoPriorTreeCuttingPermission, CommencementCertificateAttached,
         UndertakingSigned, ChallanAttached,
         CurrentRemarks, CreatedAt, UpdatedAt, SubmittedAt)
    VALUES
        ('PMRDA/TNOC/PROV/2026/0038', 0, 3, @applicantId,
         'Prashant Gaikwad', 'Survey No. 67/3, Undri, Pune 411060',
         '9765432109', 55, 'Landowner', '67/3', 'Undri', 'Haveli', 'Pune',
         6800, '18.4803°N, 73.9285°E', 8, 85,
         1, 0, 1, 0,
         'Commencement certificate missing. Tree survey report does not include girth measurements. Please resubmit with corrections.',
         '2026-10-09T11:00:00', '2026-10-12T14:00:00', '2026-10-10T09:00:00');

    DECLARE @app3Id INT = SCOPE_IDENTITY();

    INSERT INTO WorkflowHistory (ApplicationId, Action, FromStatus, ToStatus, Remarks, PerformedByUserId, PerformedAt)
    VALUES
        (@app3Id, 'Application Submitted',   0, 1, NULL,                                                                        @applicantId, '2026-10-10T09:00:00'),
        (@app3Id, 'Returned for Correction', 2, 3, 'Commencement certificate missing. Tree survey report incomplete.', @assistantId, '2026-10-12T14:00:00');
END
GO

-- =============================================================================
-- STATUS ENUM REFERENCE (for your reference when querying)
-- =============================================================================
-- ApplicationStatus: 0=Draft 1=Submitted 2=UnderScrutiny 3=ReturnedForCorrection
--                    4=UnderInspection 5=InspectionReportSubmitted 6=UnderReview
--                    7=PendingDecision 8=ChallanPending 9=Approved 10=Rejected
-- NocType:           0=Provisional 1=Final
-- SystemRole:        0=Applicant 1=Assistant 2=Superintendent 3=Authority 4=SuperAdmin
-- =============================================================================

PRINT 'PMRDA_NOC database setup complete.';
PRINT 'Demo login: applicant / assistant / superintendent / hod / admin';
PRINT 'Password for all accounts: Password@123';
GO
