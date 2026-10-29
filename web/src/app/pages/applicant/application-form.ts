import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MockNocService } from '../../core/mock.service';
import { NocType, TreeInventoryItem } from '../../core/models';
import { treesRequired, problemMessage } from '../../core/support';
import { MockPaymentService, PaymentModal, PaymentResult } from '../../shared/payment-modal';

const PROVISIONAL_CHECKLIST = [
  { num: 1, label: 'Application letter with address, mobile number and reasons for obtaining Provisional Tree NOC' },
  { num: 2, label: 'Land Ownership Documents' },
  { num: 3, label: 'Draft Master Layout and Landscape Plan with plot area details and Google co-ordinates, signed by developer and architect' },
  { num: 4, label: 'Location map showing existing trees (Green) and proposed plantation (Blue), signed by architect and environmental consultant' },
  { num: 5, label: 'Tree Survey Report — total trees, common & scientific names, age, height, girth, colour photographs; signed by environmental consultant' },
  { num: 6, label: 'Undertaking for compliance with tree deposit, tree survival and required plantation (After inward)' },
  { num: 7, label: 'Final Provisional Tree NOC submission letter authorised with PMRDA stamp' },
  { num: 8, label: 'Proposed Tree Plantation List' },
  { num: 9, label: 'Google Co-ordinates of site (last 5 years)' },
  { num: 10, label: 'Current Google Co-ordinates of construction site' },
  { num: 11, label: 'Commencement Certificate' },
  { num: 12, label: 'Letter from owner confirming no tree cutting at project site' },
  { num: 13, label: 'Detailed site-visit/tree survey report verified by PMRDA experts (total trees, plot area, species, age, height, girth, plantation count, remarks)' },
  { num: 14, label: 'Deposit Challan for tree plantation', isPayment: true },
];

const FINAL_CHECKLIST = [
  { num: 1, label: 'Application letter with address, mobile number and reasons for obtaining Final Tree Completion / Part Completion NOC' },
  { num: 2, label: 'Land Ownership Documents' },
  { num: 3, label: 'Commencement Certificate' },
  { num: 4, label: 'Sanctioned building plan with plot area details and Google co-ordinates, signed by developer and architect' },
  { num: 5, label: 'Location of trees present/planted on site (Green) shown on sanctioned plan/blueprint, signed by architect and environmental consultant' },
  { num: 6, label: 'Tree Survey / Geotagging Report — total trees, common & scientific names, age, height, girth, colour photographs; signed by environmental consultant' },
  { num: 7, label: 'Provisional Tree NOC copy' },
  { num: 8, label: 'Previous Tree Cutting or Transplantation NOC with tree details (if any)' },
  { num: 9, label: 'Geotagging report of Compensatory Plantation with tree details and photographs' },
  { num: 10, label: 'Undertaking for compliance for tree plantation and tree survival required as per plot area (After inward)' },
  { num: 11, label: 'Letter from owner confirming no tree cutting at project site' },
  { num: 12, label: 'Detailed site-visit/tree survey report verified by PMRDA experts' },
  { num: 13, label: 'Copy of Challan details / payment receipt', isPayment: true },
  { num: 14, label: 'Final Tree Completion / Part Completion NOC submission letter authorised with PMRDA stamp' },
];

@Component({
  selector: 'app-application-form',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, PaymentModal, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1>{{ step() === 0 ? 'New Application' : 'Application — ' + nocTypeLabel() }}</h1>
        <div class="breadcrumb">
          <a routerLink="/">Home</a><span>/</span>
          <a routerLink="/applications">My Applications</a><span>/</span>
          <span>New</span>
        </div>
      </div>
    </div>

    <!-- Steps indicator -->
    @if (step() > 0) {
      <div class="steps">
        @for (s of steps; track s.num) {
          <div class="step" [class.done]="step() > s.num" [class.active]="step() === s.num">
            <div class="step-dot">
              @if (step() > s.num) { <i class="fa-solid fa-check"></i> } @else { {{ s.num }} }
            </div>
            <span class="step-label">{{ s.label }}</span>
          </div>
          @if (!$last) { <div class="step-line" [class.done]="step() > s.num"></div> }
        }
      </div>
    }

    <!-- STEP 0: Select NOC Type -->
    @if (step() === 0) {
      <div class="type-select-page">
        <h2>Select NOC Type</h2>
        <p>Choose the type of Tree NOC you want to apply for:</p>
        <div class="type-cards">
          <div class="type-card" (click)="selectNocType('Provisional')" [class.selected]="selectedType() === 'Provisional'">
            <div class="type-icon prov"><i class="fa-solid fa-seedling"></i></div>
            <h3>Provisional Tree NOC</h3>
            <p>For <strong>proposed development</strong> before construction begins.</p>
            <ul>
              <li>Existing tree inventory required</li>
              <li>Proposed plantation plan</li>
              <li>Master layout and landscape plan</li>
              <li>14 mandatory documents</li>
            </ul>
            <div class="type-card-footer">
              @if (selectedType() === 'Provisional') {
                <span class="selected-mark"><i class="fa-solid fa-circle-check"></i> Selected</span>
              } @else {
                <span class="select-hint">Click to select</span>
              }
            </div>
          </div>
          <div class="type-card" (click)="selectNocType('Final')" [class.selected]="selectedType() === 'Final'">
            <div class="type-icon final"><i class="fa-solid fa-tree"></i></div>
            <h3>Final Tree Completion NOC</h3>
            <p>For <strong>completed projects</strong> — required for Occupancy Certificate.</p>
            <ul>
              <li>Sanctioned building plan required</li>
              <li>Geotagging of all planted trees</li>
              <li>Provisional NOC copy required</li>
              <li>14 mandatory documents</li>
            </ul>
            <div class="type-card-footer">
              @if (selectedType() === 'Final') {
                <span class="selected-mark"><i class="fa-solid fa-circle-check"></i> Selected</span>
              } @else {
                <span class="select-hint">Click to select</span>
              }
            </div>
          </div>
        </div>
        <div class="step-actions">
          <a routerLink="/applications" class="btn btn-secondary">Cancel</a>
          <button class="btn btn-primary btn-lg" [disabled]="!selectedType()" (click)="startApplication()">
            Continue <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    }

    <!-- STEP 1: Applicant & Property Details -->
    @if (step() === 1) {
      <form [formGroup]="detailsForm" (ngSubmit)="goStep(2)">
        <div class="panel">
          <div class="panel-heading"><h3><i class="fa-solid fa-user"></i> Applicant Details</h3></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="field">
                <label>Full Name <span class="req">*</span></label>
                <input class="input" formControlName="applicantName" placeholder="Name of applicant / developer">
                @if (s1() && detailsForm.get('applicantName')?.invalid) { <span class="field-error">Required</span> }
              </div>
              <div class="field">
                <label>Mobile Number <span class="req">*</span></label>
                <input class="input" formControlName="mobileNumber" placeholder="10-digit mobile number">
                @if (s1() && detailsForm.get('mobileNumber')?.invalid) { <span class="field-error">Required</span> }
              </div>
              <div class="field full">
                <label>Address <span class="req">*</span></label>
                <textarea class="input" formControlName="applicantAddress" rows="2" placeholder="Residential / office address"></textarea>
                @if (s1() && detailsForm.get('applicantAddress')?.invalid) { <span class="field-error">Required</span> }
              </div>
              <div class="field">
                <label>Age (years)</label>
                <input class="input" type="number" formControlName="age" placeholder="Age">
              </div>
              <div class="field">
                <label>Occupation</label>
                <input class="input" formControlName="occupation" placeholder="e.g. Builder, Developer, Landowner">
              </div>
              <div class="field">
                <label>Authorised Signatory</label>
                <input class="input" formControlName="authorisedSignatory" placeholder="Name of authorised signatory">
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-heading"><h3><i class="fa-solid fa-map-location-dot"></i> Property Details</h3></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="field">
                <label>Survey / Gat Number <span class="req">*</span></label>
                <input class="input" formControlName="surveyNumber" placeholder="e.g. 123/1">
                @if (s1() && detailsForm.get('surveyNumber')?.invalid) { <span class="field-error">Required</span> }
              </div>
              <div class="field">
                <label>Plot Number</label>
                <input class="input" formControlName="plotNumber" placeholder="Plot number">
              </div>
              <div class="field">
                <label>Village (Mauje) <span class="req">*</span></label>
                <input class="input" formControlName="village" placeholder="Village name">
                @if (s1() && detailsForm.get('village')?.invalid) { <span class="field-error">Required</span> }
              </div>
              <div class="field">
                <label>Taluka <span class="req">*</span></label>
                <input class="input" formControlName="taluka" placeholder="Taluka">
                @if (s1() && detailsForm.get('taluka')?.invalid) { <span class="field-error">Required</span> }
              </div>
              <div class="field">
                <label>District</label>
                <input class="input" formControlName="district" placeholder="District" readonly>
              </div>
              <div class="field">
                <label>Plot Area (sq. metres) <span class="req">*</span></label>
                <input class="input" type="number" formControlName="plotAreaSqm" placeholder="e.g. 4500">
                @if (detailsForm.get('plotAreaSqm')?.value) {
                  <span class="field-hint">Required plantation: <strong>{{ treesReq() }} trees</strong> (1 per 80 sq.m)</span>
                }
              </div>
              <div class="field">
                <label>Google Co-ordinates</label>
                <input class="input" formControlName="googleCoordinates" placeholder="e.g. 18.5204°N, 73.8567°E">
              </div>
              @if (selectedType() === 'Provisional') {
                <div class="field">
                  <label>Google Co-ordinates (Last 5 Years)</label>
                  <input class="input" formControlName="googleCoordinatesLast5Years" placeholder="Historical coordinates">
                </div>
              }
              @if (selectedType() === 'Final') {
                <div class="field">
                  <label>Provisional NOC Number</label>
                  <input class="input" formControlName="provisionalNocNumber" placeholder="e.g. PMRDA/TNOC/PROV/2025/0015">
                </div>
              }
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button type="button" class="btn btn-secondary" (click)="step.set(0)">Back</button>
          <button type="submit" class="btn btn-primary">Next: Tree Inventory <i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </form>
    }

    <!-- STEP 2: Tree Inventory -->
    @if (step() === 2) {
      <div class="panel">
        <div class="panel-heading">
          <h3><i class="fa-solid fa-tree"></i> Tree Inventory</h3>
          <button class="btn btn-sm btn-primary" (click)="addTree()">
            <i class="fa-solid fa-plus"></i> Add Tree
          </button>
        </div>
        <div class="panel-body">
          <p class="text-muted" style="margin:0 0 12px">
            Record all existing trees on site. Plot area: <strong>{{ detailsForm.get('plotAreaSqm')?.value }} sq.m</strong>
            — Plantation required: <strong>{{ treesReq() }} trees</strong>
          </p>
          @if (treeInventory().length === 0) {
            <div class="empty-hint">
              <i class="fa-solid fa-tree"></i>
              <p>No trees added yet. Click "Add Tree" to record existing trees on the plot.</p>
            </div>
          } @else {
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Tree No.</th>
                    <th>Common Name</th>
                    <th>Scientific Name</th>
                    <th>Age (yr)</th>
                    <th>Height (m)</th>
                    <th>Girth (m)</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (tree of treeInventory(); track $index; let i = $index) {
                    @if (editingIndex() === i) {
                      <tr class="editing-row">
                        <td><input class="input input-sm" [(ngModel)]="treeEdit.treeNumber" placeholder="T-01"></td>
                        <td><input class="input input-sm" [(ngModel)]="treeEdit.commonName" placeholder="Neem"></td>
                        <td><input class="input input-sm" [(ngModel)]="treeEdit.scientificName" placeholder="Azadirachta indica"></td>
                        <td><input class="input input-sm" type="number" [(ngModel)]="treeEdit.ageYears" placeholder="10"></td>
                        <td><input class="input input-sm" type="number" [(ngModel)]="treeEdit.heightMetres" step="0.1" placeholder="5.0"></td>
                        <td><input class="input input-sm" type="number" [(ngModel)]="treeEdit.girthMetres" step="0.01" placeholder="0.90"></td>
                        <td><input class="input input-sm" type="number" [(ngModel)]="treeEdit.latitude" step="0.0001" placeholder="18.5204"></td>
                        <td><input class="input input-sm" type="number" [(ngModel)]="treeEdit.longitude" step="0.0001" placeholder="73.8567"></td>
                        <td class="nowrap">
                          <button class="btn btn-sm btn-primary" (click)="saveTree(i)"><i class="fa-solid fa-check"></i></button>
                          <button class="btn btn-sm btn-secondary" (click)="cancelEdit()"><i class="fa-solid fa-xmark"></i></button>
                        </td>
                      </tr>
                    } @else {
                      <tr>
                        <td><strong>{{ tree.treeNumber }}</strong></td>
                        <td>{{ tree.commonName }}</td>
                        <td><em>{{ tree.scientificName }}</em></td>
                        <td>{{ tree.ageYears ?? '—' }}</td>
                        <td>{{ tree.heightMetres ?? '—' }}</td>
                        <td>{{ tree.girthMetres ?? '—' }}</td>
                        <td>{{ tree.latitude ?? '—' }}</td>
                        <td>{{ tree.longitude ?? '—' }}</td>
                        <td class="nowrap">
                          <button class="btn btn-sm btn-secondary" (click)="editTree(i)"><i class="fa-solid fa-pencil"></i></button>
                          <button class="btn btn-sm btn-danger" (click)="removeTree(i)"><i class="fa-solid fa-trash"></i></button>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          }

          @if (selectedType() === 'Provisional') {
            <div class="field" style="margin-top:16px">
              <label>Proposed Tree Plantation List</label>
              <textarea class="input" [ngModel]="proposedPlantation()" (ngModelChange)="proposedPlantation.set($event)"
                rows="3" placeholder="e.g. Neem (20), Peepal (15), Gulmohar (10), Rain Tree (5)..."></textarea>
              <span class="field-hint">List native varieties to be planted as per Tree Authority norms</span>
            </div>
          }
        </div>
      </div>

      <div class="step-actions">
        <button class="btn btn-secondary" (click)="step.set(1)">Back</button>
        <button class="btn btn-primary" (click)="step.set(3)">Next: Upload Documents <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    }

    <!-- STEP 3: Document Upload -->
    @if (step() === 3) {
      <div class="panel">
        <div class="panel-heading">
          <h3><i class="fa-solid fa-file-arrow-up"></i> Document Upload Checklist</h3>
          <div style="display:flex;align-items:center;gap:12px">
            <span class="text-muted" style="font-size:13px">{{ uploadedCount() }} / {{ checklist().length }} uploaded</span>
            <button class="btn btn-sm btn-secondary" (click)="downloadChecklist()">
              <i class="fa-solid fa-download"></i> Download Checklist
            </button>
          </div>
        </div>
        <div class="panel-body">
          <div class="alert alert-info">
            <i class="fa-solid fa-circle-info"></i>
            Upload all mandatory documents. Items marked <strong>"After inward"</strong> can be submitted after the application is inwarded by PMRDA staff.
          </div>
          <ul class="checklist">
            @for (item of checklist(); track item.num) {
              <li class="checklist-item">
                <div class="checklist-num">{{ item.num }}</div>
                <div class="checklist-content">
                  <div class="checklist-label">{{ item.label }}</div>

                  @if (item.isPayment) {
                    <!-- Payment item — show Razorpay button or receipt -->
                    @if (challanPaid()) {
                      <div class="checklist-uploaded ok">
                        <i class="fa-solid fa-circle-check"></i>
                        <strong>₹{{ challanPaid()!.amount.toLocaleString('en-IN') }} paid</strong>
                        &nbsp;·&nbsp; Challan: <span style="font-family:monospace;font-size:12px">{{ challanPaid()!.challanNumber }}</span>
                        &nbsp;·&nbsp; <span style="font-size:12px;color:#666">{{ challanPaid()!.paymentId }}</span>
                      </div>
                    } @else {
                      <div class="checklist-uploaded">
                        <button class="btn btn-sm pay-online-btn" (click)="showPayment.set(true)">
                          <i class="fa-solid fa-credit-card"></i> Pay Online ₹{{ paymentFee() | number }}
                        </button>
                        <span class="text-muted" style="font-size:12px">HDFC · UPI · Cards · Net Banking</span>
                      </div>
                    }
                  } @else {
                    <!-- Regular file upload -->
                    @if (uploadedFiles()[item.num]; as file) {
                      <div class="checklist-uploaded ok">
                        <i class="fa-solid fa-circle-check"></i>
                        {{ file.name }} ({{ (file.size / 1024).toFixed(0) }} KB)
                        <button class="btn btn-sm btn-danger upload-btn" style="margin-left:8px" (click)="removeFile(item.num)">
                          <i class="fa-solid fa-xmark"></i> Remove
                        </button>
                      </div>
                    } @else {
                      <div class="checklist-uploaded">
                        <label class="btn btn-sm btn-secondary upload-btn" style="cursor:pointer">
                          <i class="fa-solid fa-upload"></i> Upload
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" style="display:none"
                            (change)="onFileChange($event, item.num)">
                        </label>
                        <span class="text-muted" style="font-size:12px">PDF, JPG or PNG</span>
                      </div>
                    }
                  }
                </div>
              </li>
            }
          </ul>
        </div>
      </div>

      <div class="step-actions">
        <button class="btn btn-secondary" (click)="step.set(2)">Back</button>
        <button class="btn btn-primary" (click)="step.set(4)">Next: Undertaking <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    }

    <!-- STEP 4: Undertaking -->
    @if (step() === 4) {
      <div class="panel">
        <div class="panel-heading"><h3><i class="fa-solid fa-file-signature"></i> Undertaking</h3></div>
        <div class="panel-body">
          <div class="undertaking-text">
            <p><strong>To,</strong><br>Metropolitan Commissioner,<br>Pune Metropolitan Regional Development Authority, Pune<br>New Administrative Building, Near Akurdi Railway Station, Akurdi, Pune 411 044.</p>

            <p><strong>Subject:</strong> {{ selectedType() === 'Provisional' ? 'Provisional' : 'Final Tree Completion' }} NOC for development on property at Survey No. <u>{{ detailsForm.get('surveyNumber')?.value }}</u>, Village - <u>{{ detailsForm.get('village')?.value }}</u>, Taluka - <u>{{ detailsForm.get('taluka')?.value }}</u>, District - Pune.</p>

            <p>Sir,</p>

            <p>I, <u>{{ detailsForm.get('applicantName')?.value }}</u>, residing at <u>{{ detailsForm.get('applicantAddress')?.value }}</u>, am the authorised signatory of Survey No. <u>{{ detailsForm.get('surveyNumber')?.value }}</u>, Village - <u>{{ detailsForm.get('village')?.value }}</u>, Taluka - <u>{{ detailsForm.get('taluka')?.value }}</u>, District - Pune. I do hereby solemnly state as under:</p>

            <ol>
              <li>The plot area of the property is <u>{{ detailsForm.get('plotAreaSqm')?.value }}</u> square metres.</li>
              <li>As per the norms (considering 1 tree per 80 square metres), <u>{{ treesReq() }}</u> trees are required to be planted on the said plot as per plot area.</li>
              @if (selectedType() === 'Provisional') {
                <li>We have not taken any tree cutting permission from any authority prior to this NOC.</li>
                <li>We have not undertaken any sort of Tree Cutting Procedure / removal of any of the trees or branches.</li>
              } @else {
                <li>Provisional NOC {{ detailsForm.get('provisionalNocNumber')?.value ? 'has' : 'has not' }} been obtained from Tree Authority, PMRDA.</li>
                <li>We have not sought any permission for removal of any of the trees for the said site from the authority.</li>
                <li>We have not cut any trees prior to and during the construction of the said plot.</li>
              }
              <li>I will be solely responsible for the verification and authentication of the survey report of existing trees submitted for this purpose.</li>
              <li>I undertake to furnish 6-monthly reports for the first 3 years from the date of plantation, along with photographs of the planted trees, and will also do the geotagging of the same.</li>
              <li>The requisite number of trees will be planted of native varieties as per the norms of the Tree Authority. I further undertake to plant the trees properly and preserve existing trees as well as newly planted trees.</li>
              @if (selectedType() === 'Final') {
                <li>Care will be taken for proper growth of the trees for <strong>7 years</strong>.</li>
              }
              <li>We will pay the requisite deposit fee while obtaining Final Tree Completion NOC from Tree Authority, PMRDA.</li>
              <li>I undertake to abide by orders under Section 8/9/10 of the Maharashtra (Urban Areas) Protection and Preservation of Trees Act, 1975, and amendments and rules of 2009 and 2021.</li>
              <li>The above undertaking will be binding upon us, our legal heirs, executors, administrators and assignees.</li>
            </ol>

            <p>Place: Pune<br>Date: {{ today() }}</p>
          </div>

          <div class="undertaking-confirm">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="undertakingAgreed" />
              <span>I have read and agree to all the above undertaking declarations. I accept full responsibility for compliance with the Tree Authority, PMRDA requirements.</span>
            </label>
          </div>
        </div>
      </div>

      <div class="step-actions">
        <button class="btn btn-secondary" (click)="step.set(3)">Back</button>
        <button class="btn btn-primary" [disabled]="!undertakingAgreed" (click)="step.set(5)">
          Next: Review & Submit <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    }

    <!-- STEP 5: Review & Submit -->
    @if (step() === 5) {
      <div class="panel">
        <div class="panel-heading"><h3><i class="fa-solid fa-list-check"></i> Review Your Application</h3></div>
        <div class="panel-body">
          <div class="review-grid">
            <div class="review-section">
              <h4>NOC Type</h4>
              <p>{{ nocTypeLabel() }}</p>
            </div>
            <div class="review-section">
              <h4>Applicant</h4>
              <p>{{ detailsForm.get('applicantName')?.value }}<br>
              {{ detailsForm.get('mobileNumber')?.value }}<br>
              {{ detailsForm.get('applicantAddress')?.value }}</p>
            </div>
            <div class="review-section">
              <h4>Property</h4>
              <p>Survey No: {{ detailsForm.get('surveyNumber')?.value }}<br>
              {{ detailsForm.get('village')?.value }}, {{ detailsForm.get('taluka')?.value }}, Pune<br>
              Plot Area: {{ detailsForm.get('plotAreaSqm')?.value }} sq.m<br>
              Trees Required: {{ treesReq() }}</p>
            </div>
            <div class="review-section">
              <h4>Tree Inventory</h4>
              <p>{{ treeInventory().length }} existing trees recorded</p>
            </div>
            <div class="review-section">
              <h4>Documents</h4>
              <p>{{ uploadedCount() }} of {{ checklist().length }} documents uploaded</p>
            </div>
            @if (challanPaid()) {
              <div class="review-section">
                <h4>Payment</h4>
                <p><i class="fa-solid fa-circle-check text-success"></i> ₹{{ challanPaid()!.amount.toLocaleString('en-IN') }} paid<br>
                <span style="font-family:monospace;font-size:12px">{{ challanPaid()!.challanNumber }}</span></p>
              </div>
            }
            <div class="review-section">
              <h4>Undertaking</h4>
              <p><i class="fa-solid fa-circle-check text-success"></i> Signed and agreed</p>
            </div>
          </div>
        </div>
      </div>

      @if (error()) {
        <div class="alert alert-error"><i class="fa-solid fa-circle-exclamation"></i> {{ error() }}</div>
      }

      <div class="step-actions">
        <button class="btn btn-secondary" (click)="step.set(4)">Back</button>
        <button class="btn btn-primary btn-lg" [disabled]="busy()" (click)="submit()">
          @if (busy()) { <i class="fa-solid fa-spinner fa-spin"></i> Submitting... }
          @else { <i class="fa-solid fa-paper-plane"></i> Submit Application }
        </button>
      </div>
    }

    <!-- Razorpay payment modal -->
    @if (showPayment()) {
      <app-payment-modal
        [amount]="paymentFee()"
        (paid)="onPaymentDone($event)"
        (cancelled)="showPayment.set(false)" />
    }
  `,
  styles: `
    /* Type selection */
    .type-select-page { max-width: 900px; }
    .type-select-page h2 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
    .type-select-page p { color: var(--text-muted); margin-bottom: 20px; }
    .type-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    @media (max-width: 600px) { .type-cards { grid-template-columns: 1fr; } }
    .type-card { background: var(--card-bg); border: 2px solid var(--border); border-radius: 10px; padding: 20px; cursor: pointer; transition: border-color .15s, background .15s; }
    .type-card:hover { border-color: var(--pmrda-green); }
    .type-card.selected { border-color: var(--pmrda-green); background: var(--pmrda-green-pale); }
    .type-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 14px; }
    .type-icon.prov { background: #e8f5e9; color: var(--pmrda-green); }
    .type-icon.final { background: #e3f2fd; color: #1565c0; }
    .type-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
    .type-card p { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; }
    .type-card ul { margin: 0; padding-left: 18px; font-size: 13px; color: var(--text-muted); }
    .type-card ul li { margin-bottom: 4px; }
    .type-card-footer { margin-top: 16px; font-size: 13px; }
    .selected-mark { color: var(--pmrda-green); font-weight: 600; }
    .select-hint { color: var(--text-muted); }

    /* Tree table */
    .editing-row { background: var(--pmrda-green-pale); }
    .input-sm { height: 30px; padding: 0 6px; font-size: 13px; width: 100%; min-width: 60px; }
    .nowrap { white-space: nowrap; display: flex; gap: 4px; }
    .empty-hint { text-align: center; padding: 30px; color: var(--text-muted); }
    .empty-hint i { font-size: 36px; opacity: .3; margin-bottom: 10px; display: block; }
    .empty-hint p { margin: 0; }

    /* Undertaking */
    .undertaking-text { background: #f8faf8; border: 1px solid var(--border); border-radius: 6px; padding: 20px; font-size: 14px; line-height: 1.7; max-height: 400px; overflow-y: auto; margin-bottom: 16px; }
    .undertaking-text p, .undertaking-text ol { margin-bottom: 12px; }
    .undertaking-text ol li { margin-bottom: 6px; }
    .undertaking-confirm { padding: 16px; background: var(--pmrda-green-pale); border-radius: 6px; }
    .checkbox-label { display: flex; gap: 12px; align-items: flex-start; cursor: pointer; }
    .checkbox-label input { margin-top: 3px; width: 16px; height: 16px; flex-shrink: 0; }

    /* Review */
    .review-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    @media (max-width: 768px) { .review-grid { grid-template-columns: 1fr 1fr; } }
    .review-section h4 { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted); margin-bottom: 6px; }
    .review-section p { margin: 0; font-size: 14px; line-height: 1.6; }

    /* Shared step actions */
    .step-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); gap: 12px; }

    /* Pay Online button */
    .pay-online-btn {
      background: #528FF0; color: #fff; border: none; border-radius: 6px;
      padding: 7px 16px; font-weight: 600; cursor: pointer; font-size: 13px;
      display: inline-flex; align-items: center; gap: 6px; transition: background .15s;
    }
    .pay-online-btn:hover { background: #3b6fd4; }
  `,
})
export class ApplicationForm {
  private readonly svc = inject(MockNocService);
  private readonly paySvc = inject(MockPaymentService);
  private readonly router = inject(Router);

  protected readonly step = signal(0);
  protected readonly selectedType = signal<NocType | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly s1 = signal(false);
  protected readonly treeInventory = signal<TreeInventoryItem[]>([]);
  protected readonly proposedPlantation = signal('');
  protected readonly editingIndex = signal<number | null>(null);
  protected readonly uploadedFiles = signal<Record<number, File>>({});
  protected readonly showPayment = signal(false);
  protected readonly challanPaid = signal<PaymentResult | null>(null);
  protected undertakingAgreed = false;

  protected readonly paymentFee = computed(() =>
    this.paySvc.calculateFee(this.selectedType() ?? 'Provisional', this.treeInventory().length)
  );

  protected treeEdit: Partial<TreeInventoryItem> = {};
  private treeIsNew = false;

  protected readonly steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Trees' },
    { num: 3, label: 'Documents' },
    { num: 4, label: 'Undertaking' },
    { num: 5, label: 'Submit' },
  ];

  protected readonly detailsForm = inject(FormBuilder).nonNullable.group({
    applicantName: ['', Validators.required],
    mobileNumber: ['', Validators.required],
    applicantAddress: ['', Validators.required],
    age: [null as number | null],
    occupation: [''],
    authorisedSignatory: [''],
    surveyNumber: ['', Validators.required],
    plotNumber: [''],
    village: ['', Validators.required],
    taluka: ['', Validators.required],
    district: ['Pune'],
    plotAreaSqm: [0, [Validators.required, Validators.min(1)]],
    googleCoordinates: [''],
    googleCoordinatesLast5Years: [''],
    provisionalNocNumber: [''],
  });

  protected nocTypeLabel() {
    return this.selectedType() === 'Provisional' ? 'Provisional Tree NOC' : 'Final Tree Completion NOC';
  }

  protected treesReq() {
    return treesRequired(this.detailsForm.get('plotAreaSqm')?.value ?? 0);
  }

  protected today() {
    return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  protected checklist() {
    return this.selectedType() === 'Final' ? FINAL_CHECKLIST : PROVISIONAL_CHECKLIST;
  }

  protected uploadedCount() {
    return Object.keys(this.uploadedFiles()).length + (this.challanPaid() ? 1 : 0);
  }

  protected selectNocType(type: NocType) {
    this.selectedType.set(type);
  }

  protected startApplication() {
    if (this.selectedType()) this.step.set(1);
  }

  protected goStep(n: number) {
    this.s1.set(true);
    if (this.detailsForm.invalid) return;
    this.step.set(n);
  }

  protected addTree() {
    const num = this.treeInventory().length + 1;
    this.treeEdit = { treeNumber: `T-${String(num).padStart(2, '0')}`, commonName: '', scientificName: '' };
    this.treeIsNew = true;
    this.treeInventory.update((t) => [...t, this.treeEdit as TreeInventoryItem]);
    this.editingIndex.set(this.treeInventory().length - 1);
  }

  protected editTree(i: number) {
    this.treeEdit = { ...this.treeInventory()[i] };
    this.treeIsNew = false;
    this.editingIndex.set(i);
  }

  protected saveTree(i: number) {
    this.treeInventory.update((list) => list.map((t, idx) => idx === i ? { ...this.treeEdit } as TreeInventoryItem : t));
    this.treeIsNew = false;
    this.editingIndex.set(null);
  }

  protected cancelEdit() {
    if (this.treeIsNew) {
      this.treeInventory.update((t) => t.slice(0, -1));
    }
    this.treeIsNew = false;
    this.editingIndex.set(null);
  }

  protected removeTree(i: number) {
    this.treeInventory.update((t) => t.filter((_, idx) => idx !== i));
  }

  protected onFileChange(e: Event, num: number) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.uploadedFiles.update((f) => ({ ...f, [num]: file }));
  }

  protected removeFile(num: number) {
    this.uploadedFiles.update((f) => { const n = { ...f }; delete n[num]; return n; });
  }

  protected downloadChecklist() {
    const items = this.checklist();
    const title = this.nocTypeLabel();
    const rows = items.map((i) => `<tr><td style="width:48px;font-weight:700;color:#2e7d32;padding:9px 12px;border-bottom:1px solid #e0e0e0">${i.num}</td><td style="padding:9px 12px;border-bottom:1px solid #e0e0e0;font-size:13px">${i.label}</td></tr>`).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} — Document Checklist</title></head><body style="font-family:Arial,sans-serif;margin:40px;color:#333">
<div style="border-top:4px solid #2e7d32;padding-top:16px;margin-bottom:20px">
  <h1 style="font-size:16px;color:#2e7d32;margin:0">Pune Metropolitan Region Development Authority (PMRDA)</h1>
  <h2 style="font-size:14px;color:#555;font-weight:400;margin:4px 0 0">Tree Authority — ${title} · Required Document Checklist</h2>
</div>
<table style="width:100%;border-collapse:collapse;margin-top:8px"><thead><tr><th style="background:#2e7d32;color:#fff;padding:9px 12px;text-align:left;font-size:13px">Sr. No.</th><th style="background:#2e7d32;color:#fff;padding:9px 12px;text-align:left;font-size:13px">Required Document / Information</th></tr></thead><tbody>${rows}</tbody></table>
<p style="margin-top:24px;font-size:11px;color:#999">For official use only. All documents must be submitted as required by PMRDA Tree Authority.<br>Reference: Maharashtra (Urban Areas) Protection and Preservation of Trees Act, 1975.</p>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `PMRDA_${this.selectedType()}_NOC_Checklist.html`; a.click();
    URL.revokeObjectURL(url);
  }

  protected onPaymentDone(result: PaymentResult) {
    this.challanPaid.set(result);
    this.showPayment.set(false);
  }

  protected submit() {
    this.s1.set(true);
    if (this.detailsForm.invalid) {
      this.error.set('Please go back to Step 1 and fill in all required fields.');
      return;
    }
    if (!this.undertakingAgreed) {
      this.error.set('Please go back to Step 4 and agree to the undertaking.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    const v = this.detailsForm.getRawValue();
    this.svc.createApplication({ nocType: this.selectedType()!, ...v } as any).subscribe({
      next: (app) => {
        this.svc.submitApplication(app.id).subscribe({
          next: (submitted) => void this.router.navigate(['/applications', submitted.id]),
          error: () => this.busy.set(false),
        });
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.error.set(problemMessage(err));
      },
    });
  }
}
