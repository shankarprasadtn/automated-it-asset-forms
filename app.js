/* JavaScript for IT Asset Agreement Automator */

// App State
let appState = {
  template: '',
  placeholders: [],
  headers: [],
  rows: [],
  mapping: {}, // placeholder -> column header
  currentPreviewIndex: 0
};

// Default Agreement Template (Markdown)
// Frozen Headers for data parsing support when user pastes data without header row
const FROZEN_HEADERS = [
  "S.NO", "Laptop Model", "Serial Number", "PC Name", "User Name",
  "AD ID", "Employee ID", "Dept", "Manager", "Directors",
  "H/O Date", "Headset", "Docking", "Mouse",
  "Replacement Laptop Model", "Replacement Serial Number",
  "Returned Laptop Model", "Returned Laptop Serial Number"
];

// Default Agreement Template (Markdown)
const DEFAULT_TEMPLATE = `<div style="text-align: center; margin-bottom: 1.25rem;">
  <img src="ups_logo.svg" alt="UPS Logo" style="height: 58px; width: auto; margin-bottom: 0.25rem; display: block; margin-left: auto; margin-right: auto;">
  <h2 style="margin: 0; font-size: 1.15rem; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #111;">RECEIPT FOR COMPANY PROPERTY</h2>
  <h3 style="margin: 0; font-size: 0.82rem; font-weight: 600; font-style: italic; color: #555;">[Technology Support Group, Region]</h3>
</div>

<table style="width: 100%; border: none; margin-bottom: 1rem; font-size: 0.82rem; border-collapse: collapse;">
  <tr style="border: none;">
    <td style="width: 60%; border: none; padding: 4px 0; color: #000;"><strong>Employee Name:</strong> {{User_Name}}</td>
    <td style="width: 40%; border: none; padding: 4px 0; color: #000;"><strong>Employee ID:</strong> {{Employee_ID}}</td>
  </tr>
  <tr style="border: none;">
    <td style="width: 60%; border: none; padding: 4px 0; color: #000;"><strong>AD ID:</strong> {{AD_ID}}</td>
    <td style="width: 40%; border: none; padding: 4px 0; color: #000;"><strong>Department:</strong> {{Dept}}</td>
  </tr>
  <tr style="border: none;">
    <td style="width: 60%; border: none; padding: 4px 0; color: #000;"><strong>Manager:</strong> {{Manager}}</td>
    <td style="width: 40%; border: none; padding: 4px 0; color: #000;">&nbsp;</td>
  </tr>
</table>

<p style="font-size: 0.82rem; line-height: 1.55; color: #111; margin-bottom: 1rem;">
  I have read and understood and will fully comply with the UPS policies on Information Use and Security Compliance (IUSC) and the <em><strong>Guidelines of Usage</strong></em> set out below, and I hereby acknowledge receipt of the company property and its related accessories as outlined in the attached Inventory list (the "Property").
</p>

<div style="margin-top: 1.25rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; font-size: 0.78rem; color: #000; line-height: 1.4;">
  <div style="width: 45%;">
    <p>_____________________________________</p>
    <p><strong>On Behalf of United Parcel Service Pvt Ltd</strong></p>
    <p style="margin-top: 0.35rem;">Date: {{H_O_Date}}</p>
  </div>
  <div style="width: 45%;">
    <p>_____________________________________</p>
    <p><strong>Employee Signature</strong></p>
    <p style="margin-top: 0.35rem;">Date: {{H_O_Date}}</p>
  </div>
</div>

<hr style="border: none; border-top: 1px dashed #bbb; margin: 1rem 0;">

<h3 style="font-size: 0.95rem; font-weight: 700; border-bottom: 1px solid #333; padding-bottom: 2px; margin-bottom: 0.85rem; text-transform: uppercase;">Guidelines of Usage</h3>

<h4 style="font-size: 0.82rem; font-weight: 700; margin: 0.6rem 0 0.3rem 0; color: #222;">General Use & Maintenance</h4>
<ul style="font-size: 0.78rem; list-style-type: none; padding-left: 0; margin-bottom: 0.85rem; line-height: 1.45;">
  <li style="margin-bottom: 0.4rem; padding-left: 1.25rem; text-indent: -1.25rem;">
    <strong>a)</strong> I agree to maintain the Property in good working condition and to return it in similar condition upon the termination of my employment with company or as and when requested by my supervisor. In addition, if I no longer have a business need, or the Company deems that I no longer need any of the item(s), I will report this information to my supervisor.
  </li>
  <li style="margin-bottom: 0.4rem; padding-left: 1.25rem; text-indent: -1.25rem;">
    <strong>b)</strong> I agree to use the equipment for its intended business purpose only, unless prior approval is granted otherwise.
  </li>
  <li style="margin-bottom: 0.4rem; padding-left: 1.25rem; text-indent: -1.25rem;">
    <strong>c)</strong> Storage, installation/loading of illegal and/or unapproved hardware or software is strictly prohibited. I will be liable for any disciplinary actions and other recourse as the law provides.
  </li>
</ul>

<h4 style="font-size: 0.82rem; font-weight: 700; margin: 0.6rem 0 0.3rem 0; color: #222;">Loss / Damage</h4>
<ul style="font-size: 0.78rem; list-style-type: none; padding-left: 0; margin-bottom: 0.85rem; line-height: 1.45;">
  <li style="margin-bottom: 0.4rem; padding-left: 1.25rem; text-indent: -1.25rem;">
    <strong>d)</strong> I understand that the risk of loss or damage of this asset remains with me to the extent permitted by local law, with the exception of events of <em>force majeure</em>¹, or if I am able to provide reasonable proof to the Company that I have exercised reasonable efforts to avoid such loss or damage.
  </li>
</ul>

<p style="font-size: 0.78rem; line-height: 1.45; color: #111; margin-bottom: 1rem;">
  I will ensure that the Company is notified immediately, or within 24 hours, if any of the item(s) are damaged, destroyed or lost. I understand that I am obligated to submit a report detailing the circumstances pertaining to the loss/damage of the Property, inclusive of a police report where the loss/damage occurred outside company premises (unless the damage is not attributable to my own negligence, misconduct or negligent omission in which case a police report may not be required).
</p>

<div style="margin-top: 0.75rem; font-size: 0.62rem; color: #666; border-top: 1px solid #ddd; padding-top: 0.35rem; line-height: 1.3;">
  ¹ 'Events of "force majeure" include but are not limited to : reasons of acts of God, riots, wars, accidents of transportation, any event outside my control and/or other similar causes ordinarily referred to as force majeure events.
</div>

<div class="page-break"></div>

<ul style="font-size: 0.78rem; list-style-type: none; padding-left: 0; margin-top: 0.65rem; margin-bottom: 0.85rem; line-height: 1.45;">
  <li style="margin-bottom: 0.45rem; padding-left: 1.25rem; text-indent: -1.25rem;">
    <strong>e)</strong> In the event that the Property is damaged through by any reason attributable to me including without limitation by reason of my negligence, misconduct or negligent omission, the repair cost shall be borne by me to the extent permitted by local law.
  </li>
  <li style="margin-bottom: 0.45rem; padding-left: 1.25rem; text-indent: -1.25rem;">
    <strong>f)</strong> If the Property, or any part(s) of it is lost by reason attributable to me, including without limitation by reason of my negligence, misconduct or negligent omission, regardless of whether the loss occurred inside or outside company premises, I shall be responsible to replace the Property with equipment of a similar make and value.
  </li>
  <li style="margin-bottom: 0.45rem; padding-left: 1.25rem; text-indent: -1.25rem;">
    <strong>g)</strong> I understand and acknowledge that the course of action to be taken in Guidelines (f) and/or (g) will be determined by UPS and will depend on the findings of the conducted investigation.
  </li>
</ul>

<h4 style="font-size: 0.82rem; font-weight: 700; margin: 0.75rem 0 0.25rem 0; color: #222; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 1px;">Security</h4>
<ul style="font-size: 0.78rem; list-style-type: none; padding-left: 0; margin-bottom: 0.85rem; line-height: 1.45;">
  <li style="margin-bottom: 0.45rem; padding-left: 1.25rem; text-indent: -1.25rem;">
    <strong>h)</strong> It is my responsibility to ensure that my system is virus free and constantly updated with the latest virus scan. All external files/email are to be scanned before use.
  </li>
  <li style="margin-bottom: 0.45rem; padding-left: 1.25rem; text-indent: -1.25rem;">
    <strong>i)</strong> I understand and acknowledge that the company has the legal right and authority to conduct unannounced inspection of all hardware and software. I understand that I must produce the Property upon demand and without delay in the event of such a request by the company.
  </li>
  <li style="margin-bottom: 0.45rem; padding-left: 1.25rem; text-indent: -1.25rem;">
    <strong>j)</strong> Lending of this Property or parts of it to person(s) other than the above named without prior consent of the Head of Department is prohibited.
  </li>
  <li style="margin-bottom: 0.45rem; padding-left: 1.25rem; text-indent: -1.25rem;">
    <strong>k)</strong> I acknowledge and agree that the Company reserves its legal right and authority to upgrade, transfer, replace, sell, retain, and confiscate the Property at all times and at any time without notice at the company's sole and absolute discretion.
  </li>
</ul>

<p style="font-size: 0.78rem; line-height: 1.45; color: #111; margin-bottom: 1rem;">
  The company reserves the right to amend its policies relating to my use of the Equipment and software on the equipment at its sole discretion at any time without prior notice to me.
</p>

<div style="text-align: center; margin: 1rem 0 0.5rem 0; font-weight: 700; font-size: 0.8rem; color: #000; letter-spacing: 1px;">
  *********************************** Equipment Inventory Listing
</div>

<table style="width: 100%; border-collapse: collapse; font-size: 0.7rem; border: 1px solid #444;">
  <thead>
    <tr style="background-color: #f5f5f5;">
      <th style="border: 1px solid #444; padding: 4px 6px; text-align: center; width: 6%;">SN</th>
      <th style="border: 1px solid #444; padding: 4px 6px; text-align: left; width: 34%;">ITEM DESCRIPTION</th>
      <th style="border: 1px solid #444; padding: 4px 6px; text-align: left; width: 28%;">SERIAL NO.</th>
      <th style="border: 1px solid #444; padding: 4px 6px; text-align: center; width: 6%;">Qty</th>
      <th style="border: 1px solid #444; padding: 4px 6px; text-align: left; width: 12%;">CONDITION</th>
      <th style="border: 1px solid #444; padding: 4px 6px; text-align: left; width: 14%;">REMARKS</th>
    </tr>
  </thead>
  <tbody>
    <!-- Main Equipment Section -->
    <tr style="background-color: #eee; font-weight: 700;">
      <td colspan="6" style="border: 1px solid #444; padding: 3px 6px;">Main Equipment</td>
    </tr>
    <tr>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;"><strong>{{Laptop_Model}}</strong></td>
      <td style="border: 1px solid #444; padding: 4px 6px;">{{Serial_Number}}</td>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">NEW</td>
      <td style="border: 1px solid #444; padding: 4px 6px;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">2</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">HOST Name / PC Name</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">{{PC_Name}}</td>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">NEW</td>
      <td style="border: 1px solid #444; padding: 4px 6px;"></td>
    </tr>
    <tr style="display: [[Has_Collected]];">
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">3</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">Collected by user: <strong>{{Replacement_Laptop_Model}}</strong></td>
      <td style="border: 1px solid #444; padding: 4px 6px;">{{Replacement_Serial_Number}}</td>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">NEW</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">COLLECTED</td>
    </tr>
    <tr style="display: [[Has_Returned]];">
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">4</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">Returned to TSG: <strong>{{Returned_Laptop_Model}}</strong></td>
      <td style="border: 1px solid #444; padding: 4px 6px;">{{Returned_Serial_Number}}</td>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">RETURNED</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">RETURNED</td>
    </tr>
    <!-- Accessories Section -->
    <tr style="background-color: #eee; font-weight: 700;">
      <td colspan="6" style="border: 1px solid #444; padding: 3px 6px;">Accessories</td>
    </tr>
    <tr>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">POWER ADAPTER</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">-</td>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">NEW</td>
      <td style="border: 1px solid #444; padding: 4px 6px;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">2</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">CARRY CASE</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">-</td>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">NEW</td>
      <td style="border: 1px solid #444; padding: 4px 6px;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">3</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">Mouse</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">{{Mouse}}</td>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">NEW</td>
      <td style="border: 1px solid #444; padding: 4px 6px;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">4</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">Headset</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">{{Headset}}</td>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">NEW</td>
      <td style="border: 1px solid #444; padding: 4px 6px;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">5</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">Docking</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">{{Docking}}</td>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">NEW</td>
      <td style="border: 1px solid #444; padding: 4px 6px;"></td>
    </tr>
    <!-- Software Section -->
    <tr style="background-color: #eee; font-weight: 700;">
      <td colspan="6" style="border: 1px solid #444; padding: 3px 6px;">Software</td>
    </tr>
    <tr>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">Standard Enterprise Image</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">Pre-installed</td>
      <td style="border: 1px solid #444; padding: 4px 6px; text-align: center;">1</td>
      <td style="border: 1px solid #444; padding: 4px 6px;">ACTIVE</td>
      <td style="border: 1px solid #444; padding: 4px 6px;"></td>
    </tr>
  </tbody>
</table>`;

// Sample Data for Testing (Based on User's Excel columns)
const SAMPLE_DATA = [
  {
    "S.NO": "1",
    "Laptop Model": "Dell Latitude 7440",
    "Serial Number": "5FX4Z73",
    "PC Name": "LAP-ENG-SREED",
    "User Name": "Samantha Reed",
    "AD ID": "sreed",
    "Employee ID": "EMP-2026-904",
    "Dept": "Product Engineering",
    "Manager": "Richard Hendricks",
    "Directors": "Jared Dunn",
    "H/O Date": "15/06/2026",
    "Headset": "Jabra Evolve2 65",
    "Docking": "Dell USB-C Dual Dock",
    "Mouse": "Logitech MX Master 3S",
    "Replacement Laptop Model": "ThinkPad T14 Gen 4",
    "Replacement Serial Number": "PF3X9Y2Z",
    "Returned Laptop Model": "ThinkPad T14 Gen 2",
    "Returned Laptop Serial Number": "PF4CFLJN"
  },
  {
    "S.NO": "2",
    "Laptop Model": "MacBook Pro 16\" M3 Max",
    "Serial Number": "C02G29XQMD6M",
    "PC Name": "LAP-OPS-MVANCE",
    "User Name": "Marcus Vance",
    "AD ID": "mvance",
    "Employee ID": "EMP-2024-312",
    "Dept": "Customer Operations",
    "Manager": "Erlich Bachman",
    "Directors": "Laurie Bream",
    "H/O Date": "12/06/2026",
    "Headset": "Logitech H390",
    "Docking": "Caldigit TS4 Thunderbolt Dock",
    "Mouse": "Apple Magic Mouse",
    "Replacement Laptop Model": "",
    "Replacement Serial Number": "",
    "Returned Laptop Model": "",
    "Returned Laptop Serial Number": ""
  }
];

// Elements
const elements = {
  templateEditor: document.getElementById('template-editor'),
  btnUploadTemplate: document.getElementById('btn-upload-template'),
  templateFileInput: document.getElementById('template-file-input'),
  btnResetTemplate: document.getElementById('btn-reset-template'),
  placeholderTagsList: document.getElementById('placeholder-tags-list'),
  
  excelDropzone: document.getElementById('excel-dropzone'),
  excelFileInput: document.getElementById('excel-file-input'),
  pasteDataInput: document.getElementById('paste-data-input'),
  btnParsePaste: document.getElementById('btn-parse-paste'),
  btnLoadSampleData: document.getElementById('btn-load-sample-data'),
  
  dataPreviewSection: document.getElementById('data-preview-section'),
  parsedCountIndicator: document.getElementById('parsed-count-indicator'),
  dataTableHeaders: document.getElementById('data-table-headers'),
  dataTableBody: document.getElementById('data-table-body'),
  btnClearData: document.getElementById('btn-clear-data'),
  
  mappingFieldsContainer: document.getElementById('mapping-fields-container'),
  btnAutoMap: document.getElementById('btn-auto-map'),
  
  btnPrevPreview: document.getElementById('btn-prev-preview'),
  btnNextPreview: document.getElementById('btn-next-preview'),
  currentRecordNum: document.getElementById('current-record-num'),
  totalRecordsNum: document.getElementById('total-records-num'),
  previewPagination: document.getElementById('preview-pagination'),
  agreementPreviewSheet: document.getElementById('agreement-preview-sheet'),
  
  btnPrintCurrent: document.getElementById('btn-print-current'),
  btnDownloadMdCurrent: document.getElementById('btn-download-md-current'),
  btnPrintAll: document.getElementById('btn-print-all'),
  btnZipAll: document.getElementById('btn-zip-all'),
  printAllContainer: document.getElementById('print-all-container'),
  
  // Theme
  darkThemeBtn: document.getElementById('dark-theme-btn'),
  lightThemeBtn: document.getElementById('light-theme-btn'),
  
  // Tabs
  btnTabTemplate: document.getElementById('btn-tab-template'),
  btnTabData: document.getElementById('btn-tab-data'),
  btnTabMapping: document.getElementById('btn-tab-mapping'),
  btnTabEdit: document.getElementById('btn-tab-edit'),
  editRecordFormContainer: document.getElementById('edit-record-form-container'),
  btnAddRecord: document.getElementById('btn-add-record'),
  btnDeleteRecord: document.getElementById('btn-delete-record'),
  btnStartManual: document.getElementById('btn-start-manual'),
  editEmptyState: document.getElementById('edit-empty-state'),
  
  // Step Titles
  currentStepTitle: document.getElementById('current-step-title'),
  currentStepSubtitle: document.getElementById('current-step-subtitle'),
  
  // Badges & Stats
  statPlaceholdersCount: document.getElementById('stat-placeholders-count'),
  statRecordsCount: document.getElementById('stat-records-count'),
  dataCountBadge: document.getElementById('data-count-badge'),
  unmappedBadge: document.getElementById('unmapped-badge'),
  bulkCountIndicator: document.getElementById('bulk-count-indicator')
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
  if (window.marked && window.marked.setOptions) {
    window.marked.setOptions({
      breaks: true,
      gfm: true
    });
  }
  initLucide();
  initTheme();
  loadDefaultTemplate();
  registerEvents();
  checkMappingStatus();
  syncReplacementInputs();
});

function initLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Theme management
function initTheme() {
  const isLight = localStorage.getItem('light-theme') === 'true';
  if (isLight) {
    document.body.classList.add('light-theme');
    elements.darkThemeBtn.classList.remove('active');
    elements.lightThemeBtn.classList.add('active');
  }
}

function setTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
    elements.darkThemeBtn.classList.remove('active');
    elements.lightThemeBtn.classList.add('active');
    localStorage.setItem('light-theme', 'true');
  } else {
    document.body.classList.remove('light-theme');
    elements.darkThemeBtn.classList.add('active');
    elements.lightThemeBtn.classList.remove('active');
    localStorage.setItem('light-theme', 'false');
  }
}

// Template Actions
function loadDefaultTemplate() {
  appState.template = DEFAULT_TEMPLATE;
  elements.templateEditor.value = DEFAULT_TEMPLATE;
  parseTemplatePlaceholders();
}

function parseTemplatePlaceholders() {
  const text = elements.templateEditor.value;
  appState.template = text;
  
  // Regex to extract placeholders {{placeholder_name}}
  const regex = /\{\{\s*([a-zA-Z0-9_\-\s]+)\s*\}\}/g;
  const tags = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    tags.add(match[1].trim());
  }
  
  appState.placeholders = Array.from(tags);
  updatePlaceholderUI();
  updateMappingUI();
  updatePreview();
}

function processTemplateFile(file) {
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  
  if (ext === 'docx') {
    const reader = new FileReader();
    reader.onload = function(e) {
      const arrayBuffer = e.target.result;
      if (!window.mammoth) {
        alert("Mammoth library is not loaded yet. Check internet connection.");
        return;
      }
      window.mammoth.convertToMarkdown({arrayBuffer: arrayBuffer})
        .then(function(result) {
          elements.templateEditor.value = result.value;
          parseTemplatePlaceholders();
        })
        .catch(function(err) {
          alert("Error reading DOCX Word document: " + err.message);
        });
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === 'pdf') {
    const reader = new FileReader();
    reader.onload = function(e) {
      const arrayBuffer = e.target.result;
      if (!window.pdfjsLib) {
        alert("PDF.js library is not loaded yet. Check internet connection.");
        return;
      }
      
      // Set PDF.js worker URL (essential)
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      const loadingTask = window.pdfjsLib.getDocument({data: arrayBuffer});
      loadingTask.promise.then(async function(pdf) {
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        elements.templateEditor.value = fullText;
        parseTemplatePlaceholders();
      }).catch(function(err) {
        alert("Error parsing PDF file: " + err.message);
      });
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === 'txt' || ext === 'md') {
    const reader = new FileReader();
    reader.onload = function(e) {
      elements.templateEditor.value = e.target.result;
      parseTemplatePlaceholders();
    };
    reader.readAsText(file);
  } else {
    alert("Unsupported template file type. Please upload a Word (.docx), PDF (.pdf), Text (.txt) or Markdown (.md) file.");
  }
}

function updatePlaceholderUI() {
  const list = elements.placeholderTagsList;
  list.innerHTML = '';
  
  elements.statPlaceholdersCount.textContent = appState.placeholders.length;
  
  if (appState.placeholders.length === 0) {
    list.innerHTML = '<span class="empty-tag">No placeholders detected. Add some using {{name}} syntax.</span>';
    return;
  }
  
  appState.placeholders.forEach(tag => {
    const tagEl = document.createElement('span');
    tagEl.className = 'placeholder-tag';
    tagEl.innerHTML = `<i data-lucide="tag" style="width: 11px; height: 11px; margin-right: 4px;"></i> ${tag}`;
    list.appendChild(tagEl);
  });
  initLucide();
}

// Tab Actions
function switchTab(tabId) {
  // Update nav buttons active state
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update visible panels
  document.querySelectorAll('.step-panel').forEach(panel => {
    panel.classList.remove('active');
    panel.style.display = 'none';
  });
  const activePanel = document.getElementById(tabId);
  if (activePanel) {
    activePanel.style.display = 'flex';
    // Trigger transition reflow
    setTimeout(() => {
      activePanel.classList.add('active');
    }, 10);
  }

  // Update titles
  if (tabId === 'template-tab') {
    elements.currentStepTitle.textContent = 'Agreement Template';
    elements.currentStepSubtitle.textContent = 'Draft your agreement and define custom placeholders';
  } else if (tabId === 'data-tab') {
    elements.currentStepTitle.textContent = 'Import Employee & Asset Data';
    elements.currentStepSubtitle.textContent = 'Load lists from Excel spreadsheets, CSVs, or copy-paste text';
  } else if (tabId === 'mapping-tab') {
    elements.currentStepTitle.textContent = 'Map Placeholders';
    elements.currentStepSubtitle.textContent = 'Link the template placeholders with data columns';
    updateMappingUI();
  } else if (tabId === 'edit-tab') {
    elements.currentStepTitle.textContent = 'Manual Record Editor';
    elements.currentStepSubtitle.textContent = 'Add, delete, or edit record values manually';
    renderManualEditForm();
  }
}

// Data Parsing
function handleDataParsed(headers, rows) {
  if (headers.length > 0) {
    if (!headers.includes("Replacement Laptop Model")) {
      headers.push("Replacement Laptop Model");
    }
    if (!headers.includes("Replacement Serial Number")) {
      headers.push("Replacement Serial Number");
    }
    if (!headers.includes("Returned Laptop Model")) {
      headers.push("Returned Laptop Model");
    }
    if (!headers.includes("Returned Laptop Serial Number")) {
      headers.push("Returned Laptop Serial Number");
    }
    
    // Also ensure every row has these keys
    rows.forEach(row => {
      if (row["Replacement Laptop Model"] === undefined) {
        row["Replacement Laptop Model"] = "";
      }
      if (row["Replacement Serial Number"] === undefined) {
        row["Replacement Serial Number"] = "";
      }
      if (row["Returned Laptop Model"] === undefined) {
        row["Returned Laptop Model"] = "";
      }
      if (row["Returned Laptop Serial Number"] === undefined) {
        row["Returned Laptop Serial Number"] = "";
      }
    });
  }

  appState.headers = headers;
  appState.rows = rows;
  appState.currentPreviewIndex = 0;
  
  // Updates UI
  elements.statRecordsCount.textContent = rows.length;
  elements.dataCountBadge.textContent = rows.length;
  elements.dataCountBadge.style.display = rows.length > 0 ? 'inline-block' : 'none';
  elements.bulkCountIndicator.textContent = rows.length;
  
  // Update Table
  renderDataTable();
  
  // Auto Map placeholders
  autoMapColumns();
  
  // Update elements active states
  const hasData = rows.length > 0;
  elements.btnPrintCurrent.disabled = !hasData;
  elements.btnDownloadMdCurrent.disabled = !hasData;
  elements.btnPrintAll.disabled = !hasData;
  elements.btnZipAll.disabled = !hasData;
  
  if (hasData) {
    elements.previewPagination.style.display = 'flex';
    elements.totalRecordsNum.textContent = rows.length;
    elements.currentRecordNum.textContent = 1;
  } else {
    elements.previewPagination.style.display = 'none';
  }
  
  updatePreview();
  checkMappingStatus();
  syncReplacementInputs();
}

function renderDataTable() {
  const headerRow = elements.dataTableHeaders;
  const tbody = elements.dataTableBody;
  
  headerRow.innerHTML = '';
  tbody.innerHTML = '';
  
  if (appState.rows.length === 0) {
    elements.dataPreviewSection.style.display = 'none';
    elements.parsedCountIndicator.textContent = '0';
    return;
  }
  
  elements.dataPreviewSection.style.display = 'block';
  elements.parsedCountIndicator.textContent = appState.rows.length;
  
  // Render Headers
  appState.headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  
  // Render Rows (Cap at 25 for preview sheet to prevent lag)
  const previewRows = appState.rows.slice(0, 25);
  previewRows.forEach(row => {
    const tr = document.createElement('tr');
    appState.headers.forEach(h => {
      const td = document.createElement('td');
      td.textContent = row[h] || '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

// Copy-Paste TSV Parser
function parsePastedTSV() {
  const pasteText = elements.pasteDataInput.value.trim();
  if (!pasteText) {
    alert("Please paste tabular data from Excel/TSV before parsing.");
    return;
  }
  
  try {
    const lines = pasteText.split(/\r?\n/);
    if (lines.length === 0 || lines[0].trim() === '') {
      throw new Error("No readable text found.");
    }
    
    // Use tab separator if tab exists, otherwise split by 2+ consecutive spaces
    const separator = lines[0].includes('\t') ? '\t' : / {2,}/;
    const firstLineCells = lines[0].split(separator).map(h => h.trim());
    
    // Detect if first line contains header keywords vs data by checking matching headers count
    let matchingHeaderCount = 0;
    const normalizedFrozen = FROZEN_HEADERS.map(h => h.replace(/[\s_\-\/\\()]/g, '').toLowerCase());
    
    firstLineCells.forEach(cell => {
      const normCell = cell.replace(/[\s_\-\/\\()]/g, '').toLowerCase();
      if (normalizedFrozen.includes(normCell) && normCell !== '') {
        matchingHeaderCount++;
      }
    });
    
    // If 3 or more cells match frozen headers, it is a header row!
    const hasHeaderRow = matchingHeaderCount >= 3;
    
    let headers = [];
    let startLineIndex = 1;
    
    if (hasHeaderRow) {
      headers = firstLineCells.filter(h => h !== '');
      startLineIndex = 1;
    } else {
      headers = [...FROZEN_HEADERS];
      startLineIndex = 0;
    }
    
    // Parse data rows
    const rows = [];
    for (let i = startLineIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cells = lines[i].split(separator).map(c => c.trim());
      const rowObj = {};
      
      headers.forEach((header, colIndex) => {
        rowObj[header] = cells[colIndex] !== undefined ? cells[colIndex] : '';
      });
      
      rows.push(rowObj);
    }
    
    if (rows.length === 0) {
      throw new Error("Found headers, but no data records were found.");
    }
    
    handleDataParsed(headers, rows);
    elements.pasteDataInput.value = ''; // clear input
    switchTab('mapping-tab'); // move to mapping step
    
  } catch (error) {
    alert("Error parsing pasted data: " + error.message);
  }
}

// Excel & CSV File Uploader
function processExcelFile(file) {
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: 'array'});
      
      if (workbook.SheetNames.length === 0) {
        throw new Error("The file contains no worksheets.");
      }
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON with header rows
      const sheetData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
      if (sheetData.length === 0) {
        throw new Error("The worksheet appears to be empty.");
      }
      
      // Filter out empty rows
      const nonEmptyRows = sheetData.filter(r => r && r.length > 0);
      if (nonEmptyRows.length === 0) {
        throw new Error("The worksheet contains no text rows.");
      }
      
      const firstRowCells = nonEmptyRows[0].map(h => String(h).trim());
      
      // Detect if first row contains header keywords vs data by checking matching headers count
      let matchingHeaderCount = 0;
      const normalizedFrozen = FROZEN_HEADERS.map(h => h.replace(/[\s_\-\/\\()]/g, '').toLowerCase());
      
      firstRowCells.forEach(cell => {
        const normCell = cell.replace(/[\s_\-\/\\()]/g, '').toLowerCase();
        if (normalizedFrozen.includes(normCell) && normCell !== '') {
          matchingHeaderCount++;
        }
      });
      
      // If 3 or more cells match frozen headers, it is a header row!
      const hasHeaderRow = matchingHeaderCount >= 3;
      
      let headers = [];
      let startRowIndex = 1;
      
      if (hasHeaderRow) {
        headers = firstRowCells.filter(h => h !== '');
        startRowIndex = 1;
      } else {
        headers = [...FROZEN_HEADERS];
        startRowIndex = 0;
      }
      
      const rows = [];
      for (let i = startRowIndex; i < nonEmptyRows.length; i++) {
        const rowData = nonEmptyRows[i];
        const rowObj = {};
        let rowHasData = false;
        
        headers.forEach((header, index) => {
          const val = rowData[index] !== undefined ? String(rowData[index]).trim() : '';
          rowObj[header] = val;
          if (val !== '') rowHasData = true;
        });
        
        if (rowHasData) {
          rows.push(rowObj);
        }
      }
      
      if (rows.length === 0) {
        throw new Error("No data records found below the header row.");
      }
      
      handleDataParsed(headers, rows);
      switchTab('mapping-tab');
      
    } catch (err) {
      alert("Error reading Excel/CSV file: " + err.message);
    }
  };
  
  reader.onerror = function() {
    alert("Failed to read the file.");
  };
  
  reader.readAsArrayBuffer(file);
}

// Mapping Fields UI
function updateMappingUI() {
  const container = elements.mappingFieldsContainer;
  container.innerHTML = '';
  
  if (appState.placeholders.length === 0 || appState.headers.length === 0) {
    container.innerHTML = `
      <div class="empty-mapping">
        <i data-lucide="alert-circle"></i>
        <p>Please ensure you have both a template containing <code>{{placeholders}}</code> and a loaded data source.</p>
      </div>
    `;
    initLucide();
    return;
  }
  
  appState.placeholders.forEach(placeholder => {
    const row = document.createElement('div');
    row.className = 'mapping-row';
    
    // Tag col
    const tagCol = document.createElement('div');
    tagCol.className = 'mapping-tag-col';
    tagCol.innerHTML = `<span class="placeholder-tag"><i data-lucide="tag" style="width: 11px; height: 11px; margin-right: 4px;"></i> ${placeholder}</span>`;
    
    // Arrow col
    const arrowCol = document.createElement('div');
    arrowCol.className = 'mapping-arrow-col';
    arrowCol.innerHTML = '<i data-lucide="arrow-right"></i>';
    
    // Select dropdown col
    const selectCol = document.createElement('div');
    selectCol.className = 'mapping-select-col';
    
    const select = document.createElement('select');
    select.dataset.placeholder = placeholder;
    
    // Default empty option
    const defOpt = document.createElement('option');
    defOpt.value = '';
    defOpt.textContent = '-- Ignore Placeholder --';
    select.appendChild(defOpt);
    
    // Header options
    appState.headers.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h;
      if (appState.mapping[placeholder] === h) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
    
    select.addEventListener('change', (e) => {
      appState.mapping[placeholder] = e.target.value;
      updatePreview();
      checkMappingStatus();
      syncReplacementInputs();
    });
    
    selectCol.appendChild(select);
    
    row.appendChild(tagCol);
    row.appendChild(arrowCol);
    row.appendChild(selectCol);
    
    container.appendChild(row);
  });
  
  initLucide();
}

// Auto map columns to placeholders
function autoMapColumns() {
  if (appState.placeholders.length === 0 || appState.headers.length === 0) return;
  
  appState.placeholders.forEach(placeholder => {
    // Normalise name (remove spaces, underscores, dashes, slashes, parentheses, lowercase)
    const normPlaceholder = placeholder.replace(/[\s_\-\/\\()]/g, '').toLowerCase();
    
    let matchedHeader = '';
    
    // 1. Try exact normalized match
    for (let h of appState.headers) {
      const normH = h.replace(/[\s_\-\/\\()]/g, '').toLowerCase();
      if (normH === normPlaceholder) {
        matchedHeader = h;
        break;
      }
    }
    
    // 2. Try substring match if no match found
    if (!matchedHeader) {
      for (let h of appState.headers) {
        const normH = h.replace(/[\s_\-\/\\()]/g, '').toLowerCase();
        if (normH.includes(normPlaceholder) || normPlaceholder.includes(normH)) {
          matchedHeader = h;
          break;
        }
      }
    }
    
    if (matchedHeader) {
      appState.mapping[placeholder] = matchedHeader;
    }
  });
  
  updateMappingUI();
}

function checkMappingStatus() {
  if (appState.placeholders.length === 0) {
    elements.unmappedBadge.style.display = 'none';
    return;
  }
  
  let unmappedCount = 0;
  appState.placeholders.forEach(p => {
    if (!appState.mapping[p]) {
      unmappedCount++;
    }
  });
  
  if (unmappedCount > 0 && appState.rows.length > 0) {
    elements.unmappedBadge.style.display = 'inline-block';
    elements.unmappedBadge.textContent = unmappedCount;
  } else {
    elements.unmappedBadge.style.display = 'none';
  }
}

// Live Document Render & Preview
function getFormattedTodayDate() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function renderDocumentHTML(recordIndex) {
  if (appState.rows.length === 0 || recordIndex >= appState.rows.length) {
    return null;
  }
  
  const record = appState.rows[recordIndex];
  let renderedText = appState.template;
  
  // Check if replacement details (collected & returned) option is checked
  const includeCollectedChk = document.getElementById('chk-include-collected');
  const includeCollected = includeCollectedChk ? includeCollectedChk.checked : true;
  const hasCollected = includeCollected ? 'table-row' : 'none';
  renderedText = renderedText.replace(/\[\[Has_Collected\]\]/g, hasCollected);
  
  const includeReturnedChk = document.getElementById('chk-include-returned');
  const includeReturned = includeReturnedChk ? includeReturnedChk.checked : true;
  const hasReturned = includeReturned ? 'table-row' : 'none';
  renderedText = renderedText.replace(/\[\[Has_Returned\]\]/g, hasReturned);
  
  // Replace all occurrences of placeholders
  appState.placeholders.forEach(placeholder => {
    const normPlaceholder = placeholder.replace(/[\s_\-\/\\()]/g, '').toLowerCase();
    let value = '';
    
    if (normPlaceholder === 'today') {
      value = getFormattedTodayDate();
    } else {
      const mappedHeader = appState.mapping[placeholder];
      value = mappedHeader !== undefined && record[mappedHeader] !== undefined ? String(record[mappedHeader]).trim() : '';
      
      // Fallback for empty date fields to Today's Date (DD/MM/YYYY format)
      if (value === '' && (normPlaceholder.includes('date') || normPlaceholder === 'day')) {
        value = getFormattedTodayDate();
      }
    }
    
    if (value === '') {
      value = appState.rows.length > 0 ? '' : `[${placeholder}]`;
    }
    
    // Regex escape function to safely replace values
    const escapedPlaceholder = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\{\\{\\s*${escapedPlaceholder}\\s*\\}\\}`, 'g');
    renderedText = renderedText.replace(regex, value);
  });
  
  // Convert Markdown to HTML
  if (window.marked && window.marked.parse) {
    return window.marked.parse(renderedText);
  }
  
  // Fallback direct text/HTML
  return renderedText.replace(/\n/g, '<br>');
}

function updatePreview() {
  const container = elements.agreementPreviewSheet.parentElement;
  
  // Remove any previously rendered dynamic sheets
  container.querySelectorAll('.dynamic-sheet').forEach(sheet => sheet.remove());
  
  if (appState.rows.length === 0) {
    elements.agreementPreviewSheet.style.display = 'block';
    elements.agreementPreviewSheet.innerHTML = `
      <div class="empty-preview-msg">
        <i data-lucide="file-text" class="large-icon"></i>
        <h3>No Preview Generated Yet</h3>
        <p>Load some data in Step 2 to generate live dynamic document previews here.</p>
      </div>
    `;
    initLucide();
    return;
  }
  
  // Hide the default placeholder sheet
  elements.agreementPreviewSheet.style.display = 'none';
  
  const html = renderDocumentHTML(appState.currentPreviewIndex);
  if (html) {
    // Split on page-break tag
    const pages = html.split(/<div class="page-break"><\/div>|<hr class="page-break">/i);
    
    pages.forEach((pageHtml, index) => {
      const sheet = document.createElement('div');
      sheet.className = 'document-sheet dynamic-sheet';
      sheet.innerHTML = pageHtml;
      
      // Page numbering decoration
      const pageIndicator = document.createElement('div');
      pageIndicator.style.position = 'absolute';
      pageIndicator.style.bottom = '1.5rem';
      pageIndicator.style.right = '2.25rem';
      pageIndicator.style.fontSize = '0.65rem';
      pageIndicator.style.color = '#777';
      pageIndicator.textContent = `Page ${index + 1} of ${pages.length}`;
      sheet.appendChild(pageIndicator);
      
      container.appendChild(sheet);
    });
  }
}

// Action Button Functions
function navigatePreview(direction) {
  if (appState.rows.length === 0) return;
  
  if (direction === 'prev') {
    appState.currentPreviewIndex = (appState.currentPreviewIndex - 1 + appState.rows.length) % appState.rows.length;
  } else {
    appState.currentPreviewIndex = (appState.currentPreviewIndex + 1) % appState.rows.length;
  }
  
  elements.currentRecordNum.textContent = appState.currentPreviewIndex + 1;
  updatePreview();
  syncReplacementInputs();
  
  // If edit tab is active, refresh the form fields
  const editTab = document.getElementById('edit-tab');
  if (editTab && editTab.classList.contains('active')) {
    renderManualEditForm();
  }
}

// Single Export / Print Functions
function printCurrentRecord() {
  if (appState.rows.length === 0) return;
  
  const html = renderDocumentHTML(appState.currentPreviewIndex);
  if (!html) return;
  
  // Split on page-break tag to make individual physical pages
  const pages = html.split(/<div class="page-break"><\/div>|<hr class="page-break">/i);
  let combinedHTML = '';
  pages.forEach((pageHtml) => {
    combinedHTML += `<div class="print-page">${pageHtml}</div>`;
  });
  
  elements.printAllContainer.innerHTML = combinedHTML;
  window.print();
}

function downloadCurrentRecordMarkdown() {
  if (appState.rows.length === 0) return;
  
  const record = appState.rows[appState.currentPreviewIndex];
  let renderedText = appState.template;
  
  // Replace Has_Collected and Has_Returned
  const includeCollectedChk = document.getElementById('chk-include-collected');
  const includeCollected = includeCollectedChk ? includeCollectedChk.checked : true;
  const hasCollected = includeCollected ? 'table-row' : 'none';
  renderedText = renderedText.replace(/\[\[Has_Collected\]\]/g, hasCollected);
  
  const includeReturnedChk = document.getElementById('chk-include-returned');
  const includeReturned = includeReturnedChk ? includeReturnedChk.checked : true;
  const hasReturned = includeReturned ? 'table-row' : 'none';
  renderedText = renderedText.replace(/\[\[Has_Returned\]\]/g, hasReturned);
  
  appState.placeholders.forEach(placeholder => {
    const mappedHeader = appState.mapping[placeholder];
    const value = mappedHeader !== undefined && record[mappedHeader] !== undefined ? record[mappedHeader] : `[${placeholder}]`;
    const escapedPlaceholder = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\{\\{\\s*${escapedPlaceholder}\\s*\\}\\}`, 'g');
    renderedText = renderedText.replace(regex, value);
  });
  
  // Deduce file name
  const empNameHeader = appState.mapping['Employee_Name'] || appState.mapping['Employee Name'] || appState.headers[0];
  const empName = record[empNameHeader] ? record[empNameHeader].replace(/[^a-zA-Z0-9]/g, '_') : 'Agreement';
  const fileName = `IT_Asset_Agreement_${empName}_${appState.currentPreviewIndex + 1}.md`;
  
  downloadFile(renderedText, fileName, 'text/markdown');
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// Bulk Exports
function printAllRecords() {
  if (appState.rows.length === 0) return;
  
  let combinedHTML = '';
  for (let i = 0; i < appState.rows.length; i++) {
    const html = renderDocumentHTML(i);
    if (html) {
      const pages = html.split(/<div class="page-break"><\/div>|<hr class="page-break">/i);
      pages.forEach((pageHtml) => {
        combinedHTML += `<div class="print-page">${pageHtml}</div>`;
      });
    }
  }
  
  elements.printAllContainer.innerHTML = combinedHTML;
  window.print();
}

function downloadAllRecordsZip() {
  if (appState.rows.length === 0) return;
  if (!window.JSZip) {
    alert("ZIP utility is not loaded yet. Check internet connection.");
    return;
  }
  
  const zip = new JSZip();
  const empNameHeader = appState.mapping['Employee_Name'] || appState.mapping['Employee Name'] || appState.headers[0];
  
  for (let i = 0; i < appState.rows.length; i++) {
    const record = appState.rows[i];
    let renderedText = appState.template;
    
    // Replace Has_Collected and Has_Returned
    const includeCollectedChk = document.getElementById('chk-include-collected');
    const includeCollected = includeCollectedChk ? includeCollectedChk.checked : true;
    const hasCollected = includeCollected ? 'table-row' : 'none';
    renderedText = renderedText.replace(/\[\[Has_Collected\]\]/g, hasCollected);
    
    const includeReturnedChk = document.getElementById('chk-include-returned');
    const includeReturned = includeReturnedChk ? includeReturnedChk.checked : true;
    const hasReturned = includeReturned ? 'table-row' : 'none';
    renderedText = renderedText.replace(/\[\[Has_Returned\]\]/g, hasReturned);
    
    appState.placeholders.forEach(placeholder => {
      const mappedHeader = appState.mapping[placeholder];
      const value = mappedHeader !== undefined && record[mappedHeader] !== undefined ? record[mappedHeader] : `[${placeholder}]`;
      const escapedPlaceholder = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\{\\{\\s*${escapedPlaceholder}\\s*\\}\\}`, 'g');
      renderedText = renderedText.replace(regex, value);
    });
    
    const empNameRaw = record[empNameHeader] || `Record_${i + 1}`;
    const empName = empNameRaw.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Agreement_${empName}.md`;
    
    zip.file(fileName, renderedText);
  }
  
  zip.generateAsync({type: 'blob'}).then(function(content) {
    downloadFile(content, 'IT_Asset_Agreements_All.zip', 'application/zip');
  }).catch(err => {
    alert("Error creating ZIP archive: " + err.message);
  });
}

// Reset State
function clearData() {
  if (confirm("Are you sure you want to clear all loaded data?")) {
    handleDataParsed([], []);
    elements.pasteDataInput.value = '';
  }
}

// Manual Record Editing & Form Sinking
function renderManualEditForm() {
  const container = elements.editRecordFormContainer;
  
  // Clear container except empty state if we need it
  container.innerHTML = '';
  
  if (appState.rows.length === 0) {
    // Show empty state
    container.appendChild(elements.editEmptyState);
    elements.editEmptyState.style.display = 'flex';
    elements.btnDeleteRecord.disabled = true;
    elements.btnAddRecord.disabled = true;
    return;
  }
  
  // Hide empty state
  elements.editEmptyState.style.display = 'none';
  elements.btnDeleteRecord.disabled = false;
  elements.btnAddRecord.disabled = false;
  
  const record = appState.rows[appState.currentPreviewIndex];
  
  // Create edit fields for each header in appState.headers
  appState.headers.forEach(header => {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    
    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = header;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-input';
    input.value = record[header] || '';
    
    // Suggest placeholder hints
    if (header === "Replacement Laptop Model") {
      input.placeholder = "Enter Spare / Replacement Laptop Model (e.g. ThinkPad T14)";
    } else if (header === "Replacement Serial Number") {
      input.placeholder = "Enter Spare / Replacement Laptop Serial Number (e.g. PF64CYV4)";
    } else {
      input.placeholder = `Enter ${header}`;
    }
    
    // On input, save immediately to appState and update preview
    input.addEventListener('input', (e) => {
      record[header] = e.target.value;
      updatePreview();
      
      // Update data table row preview if it is displayed
      const tableRows = elements.dataTableBody.querySelectorAll('tr');
      if (tableRows.length > appState.currentPreviewIndex) {
        const rowEl = tableRows[appState.currentPreviewIndex];
        const cells = rowEl.querySelectorAll('td');
        const headerIndex = appState.headers.indexOf(header);
        if (headerIndex !== -1 && cells.length > headerIndex) {
          cells[headerIndex].textContent = e.target.value;
        }
      }
      
      // Sync replacement inputs on tab 2 if they are modified
      syncReplacementInputs();
    });
    
    formGroup.appendChild(label);
    formGroup.appendChild(input);
    container.appendChild(formGroup);
  });
}

function addNewRecord() {
  // Determine headers if none are loaded
  if (appState.headers.length === 0) {
    appState.headers = [...FROZEN_HEADERS];
  }
  
  const newRow = {};
  appState.headers.forEach(h => {
    if (h === 'S.NO') {
      newRow[h] = String(appState.rows.length + 1);
    } else {
      newRow[h] = '';
    }
  });
  
  appState.rows.push(newRow);
  appState.currentPreviewIndex = appState.rows.length - 1;
  
  // Refresh UI
  syncDataState();
  renderManualEditForm();
  
  // Move to edit tab
  switchTab('edit-tab');
}

function deleteCurrentRecord() {
  if (appState.rows.length === 0) return;
  
  if (confirm(`Are you sure you want to delete Record ${appState.currentPreviewIndex + 1}?`)) {
    appState.rows.splice(appState.currentPreviewIndex, 1);
    
    // Re-index S.NO columns for subsequent rows if desired
    appState.rows.forEach((row, index) => {
      if (row['S.NO'] !== undefined && !isNaN(row['S.NO'])) {
        row['S.NO'] = String(index + 1);
      }
    });
    
    // Adjust current preview index
    if (appState.currentPreviewIndex >= appState.rows.length) {
      appState.currentPreviewIndex = Math.max(0, appState.rows.length - 1);
    }
    
    // Refresh UI
    syncDataState();
    renderManualEditForm();
  }
}

function startManualEntry() {
  appState.headers = [...FROZEN_HEADERS];
  appState.rows = [];
  addNewRecord();
}

function syncDataState() {
  elements.statRecordsCount.textContent = appState.rows.length;
  elements.dataCountBadge.textContent = appState.rows.length;
  elements.dataCountBadge.style.display = appState.rows.length > 0 ? 'inline-block' : 'none';
  elements.bulkCountIndicator.textContent = appState.rows.length;
  
  // Reset preview indicators
  const hasData = appState.rows.length > 0;
  elements.btnPrintCurrent.disabled = !hasData;
  elements.btnDownloadMdCurrent.disabled = !hasData;
  elements.btnPrintAll.disabled = !hasData;
  elements.btnZipAll.disabled = !hasData;
  
  if (hasData) {
    elements.previewPagination.style.display = 'flex';
    elements.totalRecordsNum.textContent = appState.rows.length;
    elements.currentRecordNum.textContent = appState.currentPreviewIndex + 1;
    elements.dataPreviewSection.style.display = 'block';
    elements.parsedCountIndicator.textContent = appState.rows.length;
  } else {
    elements.previewPagination.style.display = 'none';
    elements.dataPreviewSection.style.display = 'none';
    elements.parsedCountIndicator.textContent = '0';
  }
  
  renderDataTable();
  autoMapColumns();
  updatePreview();
  checkMappingStatus();
  syncReplacementInputs();
}

// Event Listeners Registration
function registerEvents() {
  // Tabs switcher
  elements.btnTabTemplate.addEventListener('click', () => switchTab('template-tab'));
  elements.btnTabData.addEventListener('click', () => switchTab('data-tab'));
  elements.btnTabMapping.addEventListener('click', () => switchTab('mapping-tab'));
  elements.btnTabEdit.addEventListener('click', () => switchTab('edit-tab'));
  
  // Manual Editing Events
  elements.btnAddRecord.addEventListener('click', addNewRecord);
  elements.btnDeleteRecord.addEventListener('click', deleteCurrentRecord);
  elements.btnStartManual.addEventListener('click', startManualEntry);
  
  // Theme Toggles
  elements.darkThemeBtn.addEventListener('click', () => setTheme('dark'));
  elements.lightThemeBtn.addEventListener('click', () => setTheme('light'));
  
  // Template editing
  elements.templateEditor.addEventListener('input', parseTemplatePlaceholders);
  elements.btnUploadTemplate.addEventListener('click', () => elements.templateFileInput.click());
  elements.templateFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      processTemplateFile(e.target.files[0]);
    }
  });
  elements.btnResetTemplate.addEventListener('click', () => {
    if (confirm("Reset template back to standard default? Your edits will be lost.")) {
      loadDefaultTemplate();
    }
  });
  
  // Copy-paste parsing
  elements.btnParsePaste.addEventListener('click', parsePastedTSV);
  elements.btnLoadSampleData.addEventListener('click', () => {
    const headers = Object.keys(SAMPLE_DATA[0]);
    handleDataParsed(headers, SAMPLE_DATA);
    switchTab('mapping-tab');
  });
  elements.btnClearData.addEventListener('click', clearData);
  
  // Excel File Drops
  elements.excelDropzone.addEventListener('click', () => elements.excelFileInput.click());
  elements.excelFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      processExcelFile(e.target.files[0]);
    }
  });
  
  elements.excelDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.excelDropzone.classList.add('dragover');
  });
  
  elements.excelDropzone.addEventListener('dragleave', () => {
    elements.excelDropzone.classList.remove('dragover');
  });
  
  elements.excelDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.excelDropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  });
  
  // Auto mapping
  elements.btnAutoMap.addEventListener('click', autoMapColumns);
  
  // Previews Pagination
  elements.btnPrevPreview.addEventListener('click', () => navigatePreview('prev'));
  elements.btnNextPreview.addEventListener('click', () => navigatePreview('next'));
  
  // Export Click Events
  elements.btnPrintCurrent.addEventListener('click', printCurrentRecord);
  elements.btnDownloadMdCurrent.addEventListener('click', downloadCurrentRecordMarkdown);
  elements.btnPrintAll.addEventListener('click', printAllRecords);
  elements.btnZipAll.addEventListener('click', downloadAllRecordsZip);
  
  // Toggle replacement laptop (collected / returned) options
  const chkIncludeCollected = document.getElementById('chk-include-collected');
  if (chkIncludeCollected) {
    chkIncludeCollected.addEventListener('change', updatePreview);
  }
  const chkIncludeReturned = document.getElementById('chk-include-returned');
  if (chkIncludeReturned) {
    chkIncludeReturned.addEventListener('change', updatePreview);
  }
  
  // Collected / Replacement inputs sync to active record
  const repModelInput = document.getElementById('replacement-model-input');
  const repSerialInput = document.getElementById('replacement-serial-input');
  
  if (repModelInput) {
    repModelInput.addEventListener('input', (e) => {
      ensureActiveRecord();
      const record = appState.rows[appState.currentPreviewIndex];
      const modelHeader = appState.headers.find(h => h.replace(/[\s_\-\/\\()]/g, '').toLowerCase() === 'replacementlaptopmodel') || 'Replacement Laptop Model';
      record[modelHeader] = e.target.value;
      updatePreview();
      
      // Update manual edit form if open on tab 4
      const editInputs = document.querySelectorAll('#edit-record-form-container input');
      editInputs.forEach(input => {
        const label = input.previousElementSibling;
        if (label && label.textContent === modelHeader) {
          input.value = e.target.value;
        }
      });
      
      updateDataTablePreviewCell(modelHeader, e.target.value);
    });
  }
  
  if (repSerialInput) {
    repSerialInput.addEventListener('input', (e) => {
      ensureActiveRecord();
      const record = appState.rows[appState.currentPreviewIndex];
      const serialHeader = appState.headers.find(h => h.replace(/[\s_\-\/\\()]/g, '').toLowerCase() === 'replacementserialnumber') || 'Replacement Serial Number';
      record[serialHeader] = e.target.value;
      updatePreview();
      
      // Update manual edit form if open on tab 4
      const editInputs = document.querySelectorAll('#edit-record-form-container input');
      editInputs.forEach(input => {
        const label = input.previousElementSibling;
        if (label && label.textContent === serialHeader) {
          input.value = e.target.value;
        }
      });
      
      updateDataTablePreviewCell(serialHeader, e.target.value);
    });
  }

  // Returned Laptop inputs sync to active record
  const retModelInput = document.getElementById('returned-model-input');
  const retSerialInput = document.getElementById('returned-serial-input');
  
  if (retModelInput) {
    retModelInput.addEventListener('input', (e) => {
      ensureActiveRecord();
      const record = appState.rows[appState.currentPreviewIndex];
      const modelHeader = appState.headers.find(h => h.replace(/[\s_\-\/\\()]/g, '').toLowerCase() === 'returnedlaptopmodel') || 'Returned Laptop Model';
      record[modelHeader] = e.target.value;
      updatePreview();
      
      // Update manual edit form if open on tab 4
      const editInputs = document.querySelectorAll('#edit-record-form-container input');
      editInputs.forEach(input => {
        const label = input.previousElementSibling;
        if (label && label.textContent === modelHeader) {
          input.value = e.target.value;
        }
      });
      
      updateDataTablePreviewCell(modelHeader, e.target.value);
    });
  }
  
  if (retSerialInput) {
    retSerialInput.addEventListener('input', (e) => {
      ensureActiveRecord();
      const record = appState.rows[appState.currentPreviewIndex];
      const serialHeader = appState.headers.find(h => h.replace(/[\s_\-\/\\()]/g, '').toLowerCase() === 'returnedlaptopserialnumber') || 'Returned Laptop Serial Number';
      record[serialHeader] = e.target.value;
      updatePreview();
      
      // Update manual edit form if open on tab 4
      const editInputs = document.querySelectorAll('#edit-record-form-container input');
      editInputs.forEach(input => {
        const label = input.previousElementSibling;
        if (label && label.textContent === serialHeader) {
          input.value = e.target.value;
        }
      });
      
      updateDataTablePreviewCell(serialHeader, e.target.value);
    });
  }
}

function syncReplacementInputs() {
  const modelInput = document.getElementById('replacement-model-input');
  const serialInput = document.getElementById('replacement-serial-input');
  const retModelInput = document.getElementById('returned-model-input');
  const retSerialInput = document.getElementById('returned-serial-input');
  const disabledNote = document.getElementById('replacement-disabled-note');
  
  if (!modelInput || !serialInput || !retModelInput || !retSerialInput) return;
  
  // They are ALWAYS enabled!
  modelInput.disabled = false;
  serialInput.disabled = false;
  retModelInput.disabled = false;
  retSerialInput.disabled = false;
  if (disabledNote) disabledNote.style.display = 'none';
  
  if (appState.rows.length > 0) {
    const record = appState.rows[appState.currentPreviewIndex];
    const modelHeader = appState.headers.find(h => h.replace(/[\s_\-\/\\()]/g, '').toLowerCase() === 'replacementlaptopmodel') || 'Replacement Laptop Model';
    const serialHeader = appState.headers.find(h => h.replace(/[\s_\-\/\\()]/g, '').toLowerCase() === 'replacementserialnumber') || 'Replacement Serial Number';
    const retModelHeader = appState.headers.find(h => h.replace(/[\s_\-\/\\()]/g, '').toLowerCase() === 'returnedlaptopmodel') || 'Returned Laptop Model';
    const retSerialHeader = appState.headers.find(h => h.replace(/[\s_\-\/\\()]/g, '').toLowerCase() === 'returnedlaptopserialnumber') || 'Returned Laptop Serial Number';
    
    modelInput.value = record[modelHeader] || '';
    serialInput.value = record[serialHeader] || '';
    retModelInput.value = record[retModelHeader] || '';
    retSerialInput.value = record[retSerialHeader] || '';
  } else {
    modelInput.value = '';
    serialInput.value = '';
    retModelInput.value = '';
    retSerialInput.value = '';
  }
}

function updateDataTablePreviewCell(header, value) {
  const tableRows = elements.dataTableBody.querySelectorAll('tr');
  if (tableRows.length > appState.currentPreviewIndex) {
    const rowEl = tableRows[appState.currentPreviewIndex];
    const cells = rowEl.querySelectorAll('td');
    const headerIndex = appState.headers.indexOf(header);
    if (headerIndex !== -1 && cells.length > headerIndex) {
      cells[headerIndex].textContent = value;
    }
  }
}

function ensureActiveRecord() {
  if (appState.rows.length === 0) {
    appState.headers = [...FROZEN_HEADERS];
    const newRow = {};
    appState.headers.forEach(h => {
      if (h === 'S.NO') {
        newRow[h] = '1';
      } else {
        newRow[h] = '';
      }
    });
    appState.rows.push(newRow);
    appState.currentPreviewIndex = 0;
    
    // Update basic stats so UI shows 1 record
    elements.statRecordsCount.textContent = 1;
    elements.dataCountBadge.textContent = 1;
    elements.dataCountBadge.style.display = 'inline-block';
    elements.bulkCountIndicator.textContent = 1;
    
    elements.btnPrintCurrent.disabled = false;
    elements.btnDownloadMdCurrent.disabled = false;
    elements.btnPrintAll.disabled = false;
    elements.btnZipAll.disabled = false;
    
    elements.previewPagination.style.display = 'flex';
    elements.totalRecordsNum.textContent = 1;
    elements.currentRecordNum.textContent = 1;
    
    renderDataTable();
  }
}
