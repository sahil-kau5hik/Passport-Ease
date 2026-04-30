/* ================================================================
   track.js — Application tracking with 5-step pipeline & PDF
   New Flow: Submitted → Documents Verified → Police Verified → Admin Approved → Passport Issued
   ================================================================ */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const container = $('appListContainer');
  const noMsg = $('noAppsMsg');
  const printArea = $('printArea');

  // Updated status steps to match new workflow
  const STATUS_STEPS = [
    { key: 'Submitted', icon: '📄', label: 'Submitted' },
    { key: 'Documents Verified', icon: '📋', label: 'Docs Verified' },
    { key: 'Police Verified', icon: '🛡️', label: 'Police Verified' },
    { key: 'Admin Approved', icon: '✅', label: 'Admin Approved' },
    { key: 'Passport Issued', icon: '🛂', label: 'Passport Issued' },
  ];

  const STATUS_ORDER = {};
  STATUS_STEPS.forEach((s, i) => STATUS_ORDER[s.key] = i + 1);
  STATUS_ORDER['Rejected'] = -1;
  STATUS_ORDER['Documents Failed'] = 1; // Same level as submitted

  function getStepState(appStatus, stepKey) {
    if (appStatus === 'Rejected') {
      const rejIdx = STATUS_ORDER[stepKey];
      return rejIdx <= 1 ? 'completed' : '';
    }
    if (appStatus === 'Documents Failed') {
      return stepKey === 'Submitted' ? 'active' : '';
    }
    const appIdx = STATUS_ORDER[appStatus] || 1;
    const stepIdx = STATUS_ORDER[stepKey] || 1;
    if (stepIdx < appIdx) return 'completed';
    if (stepIdx === appIdx) return 'active';
    return '';
  }

  function renderApps() {
    const apps = lsGet(LS_KEYS.APPLICATIONS, []);
    container.innerHTML = '';
    if (apps.length === 0) { noMsg.classList.remove('hidden'); return; }
    noMsg.classList.add('hidden');

    [...apps].reverse().forEach(app => {
      const sc = getStatusClass(app.status);
      const card = document.createElement('div');
      card.className = 'section-card';

      // Tracker steps
      let stepsHTML = '';
      STATUS_STEPS.forEach(step => {
        const state = getStepState(app.status, step.key);
        stepsHTML += `<div class="tracker-step ${state}"><div class="step-circle">${step.icon}</div><div class="step-label">${step.label}</div></div>`;
      });

      let rejectedBanner = '';
      if (app.status === 'Rejected') {
        rejectedBanner = `<div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:var(--radius-sm);padding:12px 18px;margin-bottom:20px;color:var(--status-rejected);font-weight:600;display:flex;align-items:center;gap:8px;">❌ Application rejected — ${app.rejectionReason || 'Contact admin for details.'}</div>`;
      }

      // Documents Failed banner with re-upload
      let docsFailedBanner = '';
      if (app.status === 'Documents Failed' && app.docStatus) {
        const failedEntries = Object.entries(app.docStatus).filter(([,v]) => v.status === 'fail');
        let failList = '';
        failedEntries.forEach(([key, val]) => {
          failList += `
            <div class="doc-reupload-section">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px">
                <div>
                  <span class="doc-verify-badge fail">❌ ${docNames[key] || key}</span>
                  <div class="doc-fail-reason">Reason: ${val.reason}</div>
                </div>
                <label class="btn btn-primary btn-sm" for="reupload_track_${app.id}_${key}" style="cursor:pointer">📁 Re-upload</label>
                <input type="file" class="hidden" id="reupload_track_${app.id}_${key}" accept="image/jpeg,image/png,image/webp" data-appid="${app.id}" data-dockey="${key}" />
              </div>
            </div>
          `;
        });
        docsFailedBanner = `
          <div style="background:rgba(239,68,68,.06);border:1.5px solid rgba(239,68,68,.25);border-radius:var(--radius-md);padding:18px;margin-bottom:20px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <span style="font-size:22px">⚠️</span>
              <div>
                <div style="font-weight:700;color:var(--error);font-size:15px">Documents Failed Verification</div>
                <div style="font-size:12px;color:var(--text-muted)">Please re-upload the failed documents below. After re-upload, admin will re-verify.</div>
              </div>
            </div>
            ${failList}
          </div>
        `;
      }

      // Admin Approved banner
      let adminApprovedBanner = '';
      if (app.status === 'Admin Approved') {
        adminApprovedBanner = `<div style="background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.25);border-radius:var(--radius-sm);padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:10px;">
          <span style="font-size:24px">✅</span>
          <div>
            <div style="font-weight:700;color:var(--success);font-size:15px">Application Approved by Admin!</div>
            <div style="font-size:12px;color:var(--text-muted)">Your passport is being processed and will be issued shortly.</div>
          </div>
        </div>`;
      }

      let passportBanner = '';
      if (app.status === 'Passport Issued') {
        passportBanner = `<div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.3);border-radius:var(--radius-sm);padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:12px;">
          <span style="font-size:32px">🛂</span>
          <div>
            <div style="font-weight:700;color:var(--success);font-size:16px">Passport Issued Successfully!</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:2px">Passport Number: <strong style="color:var(--accent);font-family:monospace">${app.passportNumber || 'N/A'}</strong></div>
          </div>
        </div>`;
      }

      // Renewal badge
      const renewalBadge = (app.applicationType === 'Renewal' || app.applicationType === 'Re-issue')
        ? `<span style="background:rgba(99,102,241,.12);color:var(--accent);font-size:11px;font-weight:600;padding:3px 10px;border-radius:12px;margin-left:8px">🔄 ${app.applicationType}</span>` : '';

      // Doc badges
      const docNames = {
        passportPhoto: '📷 Photo', aadhaarCard: '🪪 Aadhaar', panCard: '💳 PAN',
        birthCertificate: '📜 DOB Proof', addressProof: '🏠 Address', signature: '✍️ Signature'
      };
      let docBadges = '';
      if (app.docs) {
        Object.keys(docNames).forEach(key => {
          if (app.docs[key]) docBadges += `<span class="status-badge approved" style="font-size:10px;padding:3px 10px">${docNames[key]} ✓</span>`;
        });
      }

      card.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
          <div>
            <div class="app-id-display" style="margin-bottom:8px">${app.id}</div>
            <div style="font-size:18px;font-weight:700;">${app.fullName}${renewalBadge}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:2px;">
              ${app.applicationType || 'Fresh'} · ${app.passportType || 'Ordinary'} · PSK: ${app.pskCity || '-'}<br/>
              Submitted on ${app.dateFormatted}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="status-badge ${sc}"><span class="status-dot"></span>${app.status}</span>
            ${app.status === 'Passport Issued' ? `
              <button class="btn btn-primary btn-sm no-print" data-renew="${app.id}">🔄 Renew</button>
              <button class="btn btn-secondary btn-sm no-print" data-print="${app.id}">🖨️ E-Passport</button>
            ` : ''}
          </div>
        </div>
        ${rejectedBanner}${docsFailedBanner}${adminApprovedBanner}${passportBanner}
        <div class="tracker-steps">${stepsHTML}</div>
        <details style="margin-top:20px;">
          <summary style="cursor:pointer;font-weight:600;color:var(--accent);font-size:14px;">View Full Details & Documents</summary>
          <div style="margin-top:16px;">
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">Name</span><span class="detail-value">${app.fullName || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">DOB</span><span class="detail-value">${app.dob || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">Gender</span><span class="detail-value">${app.gender || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">Father</span><span class="detail-value">${app.fatherName || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">Mother</span><span class="detail-value">${app.motherName || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">Mobile</span><span class="detail-value">${app.mobile || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">Aadhaar</span><span class="detail-value">${app.aadhaarNumber || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">PSK City</span><span class="detail-value">${app.pskCity || '-'}</span></div>
              <div class="detail-item" style="grid-column:1/-1"><span class="detail-label">Address</span><span class="detail-value">${app.presentAddress || '-'}, ${app.presentCity || ''}, ${app.presentState || ''} - ${app.presentPincode || ''}</span></div>
              ${(app.applicationType === 'Renewal' || app.applicationType === 'Re-issue') ? `
              <div class="detail-item"><span class="detail-label">Old Passport</span><span class="detail-value" style="font-family:monospace;font-weight:700">${app.oldPassportNumber || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">Old Issue Date</span><span class="detail-value">${app.oldPassportIssueDate || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">Old Expiry Date</span><span class="detail-value">${app.oldPassportExpiryDate || '-'}</span></div>
              <div class="detail-item"><span class="detail-label">Renewal Reason</span><span class="detail-value">${app.renewalReason || '-'}</span></div>
              ` : ''}
            </div>
            <h4 style="margin-top:20px;margin-bottom:12px;font-size:14px;font-weight:700;">📎 Documents</h4>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">${docBadges || '<span style="color:var(--text-muted);font-size:13px;">No documents</span>'}</div>
          </div>
        </details>
      `;
      container.appendChild(card);
    });

    // Print handlers
    container.querySelectorAll('[data-print]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); printApp(btn.dataset.print); });
    });

    // Renew handlers
    container.querySelectorAll('[data-renew]').forEach(btn => {
      btn.addEventListener('click', e => { 
        e.stopPropagation(); 
        localStorage.setItem('pe_renew_id', btn.dataset.renew);
        window.location.href = 'apply.html';
      });
    });

    // Re-upload handlers for failed docs
    container.querySelectorAll('input[data-appid][data-dockey]').forEach(input => {
      input.addEventListener('change', function () {
        if (!this.files.length) return;
        const file = this.files[0];
        const appId = this.dataset.appid;
        const docKey = this.dataset.dockey;

        if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
          showToast('Invalid format. Only JPG, PNG, WebP.', 'error'); return;
        }
        if (file.size > 2 * 1024 * 1024) {
          showToast('File too large. Max 2MB.', 'error'); return;
        }

        const reader = new FileReader();
        reader.onload = e => {
          const apps = lsGet(LS_KEYS.APPLICATIONS, []);
          const app = apps.find(a => a.id === appId);
          if (!app) return;
          app.docs[docKey] = e.target.result;
          // Reset the failed doc status
          if (app.docStatus && app.docStatus[docKey]) {
            app.docStatus[docKey] = { status: 'pending', reason: '' };
          }
          // Check if all failed docs are now re-uploaded
          const stillFailed = Object.entries(app.docStatus || {}).filter(([,v]) => v.status === 'fail');
          if (stillFailed.length === 0) {
            app.status = 'Submitted'; // send back for doc re-verification by admin
            delete app.failedDocsMessage;
          }
          lsSet(LS_KEYS.APPLICATIONS, apps);
          PE.saveApplication(app);  // persist re-upload to Supabase
          showToast(`${docKey} re-uploaded! ${stillFailed.length === 0 ? 'Sent back to admin for verification.' : `${stillFailed.length} document(s) still need re-upload.`}`, 'success');
          renderApps();
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function printApp(appId) {
    const apps = lsGet(LS_KEYS.APPLICATIONS, []);
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    const sc = getStatusClass(app.status);

    // Renewal info for print
    let renewalPrint = '';
    if (app.applicationType === 'Renewal' || app.applicationType === 'Re-issue') {
      renewalPrint = `
        <div class="detail-grid" style="margin-top:16px">
          <div class="detail-item"><span class="detail-label">Application Type</span><span class="detail-value">🔄 ${app.applicationType}</span></div>
          <div class="detail-item"><span class="detail-label">Old Passport</span><span class="detail-value">${app.oldPassportNumber || '-'}</span></div>
          <div class="detail-item"><span class="detail-label">Reason</span><span class="detail-value">${app.renewalReason || '-'}</span></div>
        </div>
      `;
    }

    printArea.innerHTML = `
      <div style="font-family: Arial, sans-serif; background: #fff; color: #000; padding: 12px 20px; max-width: 800px; margin: 0 auto; line-height: 1.4; border: 2px solid #000; box-sizing:border-box;">
        
        <!-- Header -->
        <div style="text-align:center; padding-bottom: 12px; border-bottom: 2px solid #000; margin-bottom: 16px;">
          <h1 style="font-size:22px; margin:0; text-transform:uppercase; letter-spacing:1px; line-height:1.2;">Ministry of External Affairs</h1>
          <p style="font-size:15px; margin:2px 0 0; text-transform:uppercase; font-weight:bold;">Government of India</p>
          <div style="margin-top:10px;">
            <span style="font-size:16px; font-weight:bold; border: 2px solid #000; padding: 6px 14px; display:inline-block; border-radius: 4px; box-shadow: 2px 2px 0px #000;">OFFICIAL E-PASSPORT CERTIFICATE</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 16px;">
          <div style="flex:1;">
            <table style="width:100%; font-size:14px; border-collapse: collapse;">
              <tr><td style="padding:4px 0; width:150px; font-weight:bold;">Application ARN:</td><td style="padding:4px 0; font-family:monospace; font-weight:bold; font-size:16px;">${app.id}</td></tr>
              <tr><td style="padding:4px 0; font-weight:bold;">Status:</td><td style="padding:4px 0;"><strong>${app.status}</strong></td></tr>
              <tr><td style="padding:4px 0; font-weight:bold;">Date of Submission:</td><td style="padding:4px 0;">${app.dateFormatted || '-'}</td></tr>
              <tr><td style="padding:4px 0; font-weight:bold;">PSK City:</td><td style="padding:4px 0;">${app.pskCity || '-'}</td></tr>
              ${app.passportNumber ? `<tr><td style="padding:4px 0; font-weight:bold; color:green;">Passport Number:</td><td style="padding:4px 0; font-family:monospace; font-weight:bold; font-size:16px; color:green;">${app.passportNumber}</td></tr>` : ''}
            </table>
          </div>
          <!-- Applicant Photo Placeholder -->
          <div style="width: 110px; height: 130px; border: 2px solid #000; display:flex; align-items:center; justify-content:center; flex-direction:column; background:#f9f9f9; text-align:center; padding:8px;">
            ${app.docs && app.docs.passportPhoto ? `<img src="${app.docs.passportPhoto}" style="width:100%; height:100%; object-fit:cover;" />` : `<span style="font-size:11px; font-weight:bold;">PASSPORT<br>SIZE<br>PHOTO</span>`}
          </div>
        </div>

        <!-- Personal Details -->
        <h3 style="font-size:15px; background:#f1f1f1; padding:6px 8px; border:1px solid #000; margin-bottom:10px; margin-top:0;">Personal Details</h3>
        <table style="width:100%; font-size:13px; border-collapse: collapse; margin-bottom:16px;">
          <tr><td style="padding:4px 6px; border:1px solid #ccc; width:150px; font-weight:bold;">Applicant Name</td><td style="padding:4px 6px; border:1px solid #ccc;" colspan="3">${app.fullName || '-'}</td></tr>
          <tr>
            <td style="padding:4px 6px; border:1px solid #ccc; font-weight:bold;">Date of Birth</td><td style="padding:4px 6px; border:1px solid #ccc; width:35%;">${app.dob || '-'}</td>
            <td style="padding:4px 6px; border:1px solid #ccc; width:15%; font-weight:bold;">Gender</td><td style="padding:4px 6px; border:1px solid #ccc;">${app.gender || '-'}</td>
          </tr>
          <tr>
            <td style="padding:4px 6px; border:1px solid #ccc; font-weight:bold;">Aadhaar Number</td><td style="padding:4px 6px; border:1px solid #ccc;">${app.aadhaarNumber || '-'}</td>
            <td style="padding:4px 6px; border:1px solid #ccc; font-weight:bold;">Mobile Number</td><td style="padding:4px 6px; border:1px solid #ccc;">${app.mobile || '-'}</td>
          </tr>
          <tr><td style="padding:4px 6px; border:1px solid #ccc; font-weight:bold;">Present Address</td><td style="padding:4px 6px; border:1px solid #ccc;" colspan="3">${app.presentAddress || '-'}, ${app.presentCity || ''}, ${app.presentState || ''} - ${app.presentPincode || ''}</td></tr>
        </table>

        ${app.applicationType === 'Renewal' || app.applicationType === 'Re-issue' ? `
        <h3 style="font-size:15px; background:#f1f1f1; padding:6px 8px; border:1px solid #000; margin-bottom:10px; margin-top:0;">Renewal Details</h3>
        <table style="width:100%; font-size:13px; border-collapse: collapse; margin-bottom:16px;">
          <tr>
            <td style="padding:4px 6px; border:1px solid #ccc; width:150px; font-weight:bold;">Application Type</td><td style="padding:4px 6px; border:1px solid #ccc;" colspan="3">🔄 ${app.applicationType}</td>
          </tr>
          <tr>
            <td style="padding:4px 6px; border:1px solid #ccc; font-weight:bold;">Old Passport</td><td style="padding:4px 6px; border:1px solid #ccc; font-family:monospace; font-weight:bold;">${app.oldPassportNumber || '-'}</td>
            <td style="padding:4px 6px; border:1px solid #ccc; font-weight:bold;">Renewal Reason</td><td style="padding:4px 6px; border:1px solid #ccc;">${app.renewalReason || '-'}</td>
          </tr>
        </table>
        ` : ''}

        <!-- Official Signatures & Stamp -->
        <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:flex-end;">
          <div style="text-align:center;">
            <div style="width:100px; height:100px; border:3px solid #d93025; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#d93025; font-weight:900; font-size:13px; position:relative; transform: rotate(-12deg); font-family:Arial, sans-serif; letter-spacing:1px; background: url('data:image/svg+xml;utf8,<svg viewBox=%220 0 100 100%22 xmlns=%22http://www.w3.org/2000/svg%22><text x=%2210%22 y=%2250%22 font-size=%2222%22 fill=%22%23d93025%22 opacity=%220.3%22 transform=%22rotate(45 50 50)%22>GOI</text></svg>');">
              <span style="border: 2px solid #d93025; padding: 4px; border-radius: 4px;">VERIFIED</span>
            </div>
            <p style="margin-top:8px; font-weight:bold; font-size:11px; text-transform:uppercase;">Regional Passport Office</p>
          </div>
          
          <div style="text-align:center;">
             <!-- Applicant Sig Placeholder -->
             ${app.docs && app.docs.signature ? `<img src="${app.docs.signature}" style="max-width:180px; max-height:60px; object-fit:contain; margin-bottom:5px;" />` : `<div style="height:60px; display:flex; align-items:center; justify-content:center; color:#999; font-style:italic;">(Signature Unavailable)</div>`}
             <div style="border-top:1px solid #000; width:200px; margin-top:5px; padding-top:4px;"></div>
             <p style="margin:0; font-weight:bold; font-size:11px;">APPLICANT SIGNATURE</p>
          </div>

          <div style="text-align:center;">
            <div style="height:60px; display:flex; align-items:flex-end; justify-content:center;">
              <p style="font-family:'Brush Script MT', cursive, sans-serif; font-size:28px; margin:0; position:relative; top:10px; color:#0e4683;">AK Sharma</p>
            </div>
            <div style="border-top:1px solid #000; width:200px; margin-top:5px; padding-top:4px;"></div>
            <p style="margin:0; font-weight:bold; font-size:11px;">ISSUING AUTHORITY</p>
          </div>
        </div>
        
        <div style="margin-top: 16px; font-size:11px; text-align:center; color:#555; border-top: 1px dashed #ccc; padding-top: 8px;">
          This is a system generated official e-Passport Certificate. Valid across all authorized physical and digital checkpoints.
        </div>
      </div>
    `;
    
    // Automatically trigger print prompt
    window.print();
  }

  function init() { renderApps(); }
window.onDBReady ? window.onDBReady(init) : document.addEventListener('DOMContentLoaded', init);
})();
