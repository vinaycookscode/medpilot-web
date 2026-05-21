import { Invoice } from '../core/models/billing.models';
import { ClinicDetail } from '../core/services/clinic.service';

function fmt(n: number) {
  return '₹' + (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function statusBadge(s: string) {
  const colors: Record<string, string> = {
    paid: '#16a34a', partial: '#d97706', overdue: '#dc2626',
    sent: '#2563eb', draft: '#6b7280', cancelled: '#6b7280',
  };
  const bg = colors[s] ?? '#6b7280';
  return `<span style="background:${bg};color:#fff;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">${s}</span>`;
}

export function printInvoice(invoice: Invoice, clinic: ClinicDetail, prescriptionMedicines?: string[], prescriptions?: { diagnosis: string; date: string; doctor: string; medicines: { name: string; dosage: string; frequency: string; duration: string; timing?: string }[] }[]) {
  const gstBlock = invoice.totalGst > 0 ? `
    <tr>
      <td colspan="3" style="text-align:right;color:#6b7280">CGST</td>
      <td style="text-align:right;color:#6b7280">${fmt(invoice.cgstAmount)}</td>
    </tr>
    <tr>
      <td colspan="3" style="text-align:right;color:#6b7280">SGST</td>
      <td style="text-align:right;color:#6b7280">${fmt(invoice.sgstAmount)}</td>
    </tr>` : '';

  const paidBlock = invoice.paidAmount > 0 ? `
    <tr>
      <td colspan="3" style="text-align:right;color:#16a34a;font-weight:600">Paid</td>
      <td style="text-align:right;color:#16a34a;font-weight:600">− ${fmt(invoice.paidAmount)}</td>
    </tr>
    <tr style="border-top:2px solid #dc2626">
      <td colspan="3" style="text-align:right;font-weight:700;color:#dc2626;font-size:15px;padding-top:6px">Balance Due</td>
      <td style="text-align:right;font-weight:700;color:#dc2626;font-size:15px;padding-top:6px">${fmt(invoice.balanceDue)}</td>
    </tr>` : '';

  const medsSection = prescriptions && prescriptions.length ? `
    <div style="margin-top:28px;padding-top:20px;border-top:1px dashed #e5e7eb">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:14px">Medicines Prescribed</p>
      ${prescriptions.map(rx => `
        <div style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="font-size:13px;font-weight:700;color:#1f2937">${rx.diagnosis}</span>
            <span style="font-size:11px;color:#9ca3af">${rx.date} · Dr. ${rx.doctor}</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="background:#f3f4f6">
                <th style="text-align:left;padding:5px 8px;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase">Medicine</th>
                <th style="text-align:left;padding:5px 8px;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase">Dosage</th>
                <th style="text-align:left;padding:5px 8px;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase">Frequency</th>
                <th style="text-align:left;padding:5px 8px;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase">Duration</th>
                <th style="text-align:left;padding:5px 8px;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase">Timing</th>
              </tr>
            </thead>
            <tbody>
              ${rx.medicines.map((m, i) => `
              <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
                <td style="padding:5px 8px;font-weight:600;color:#1f2937">${m.name}</td>
                <td style="padding:5px 8px;color:#374151">${m.dosage}</td>
                <td style="padding:5px 8px;color:#374151">${m.frequency}</td>
                <td style="padding:5px 8px;color:#374151">${m.duration}</td>
                <td style="padding:5px 8px;color:#9ca3af">${m.timing || '—'}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`).join('')}
    </div>` : (prescriptionMedicines && prescriptionMedicines.length ? `
    <div style="margin-top:24px;padding-top:16px;border-top:1px dashed #e5e7eb">
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:8px">Medicines Prescribed</p>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:1.8">
        ${prescriptionMedicines.map(m => `<li>${m}</li>`).join('')}
      </ul>
    </div>` : '');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color:#1f2937; background:#fff; font-size:13px; }
    .page { max-width:760px; margin:0 auto; padding:32px 40px; }
    table { width:100%; border-collapse:collapse; }
    td, th { padding:8px 10px; }
    @media print {
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .no-print { display:none; }
      @page { margin:15mm 15mm; size:A4; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px">
    <div>
      <h1 style="font-size:22px;font-weight:800;color:#1e3a5f;margin-bottom:4px">${clinic.name}</h1>
      ${clinic.addressLine1 ? `<p style="font-size:12px;color:#6b7280">${clinic.addressLine1}</p>` : ''}
      <p style="font-size:12px;color:#6b7280">${[clinic.city, clinic.state, clinic.pincode].filter(Boolean).join(', ')}</p>
      ${clinic.phone ? `<p style="font-size:12px;color:#6b7280">Ph: ${clinic.phone}</p>` : ''}
      ${clinic.email ? `<p style="font-size:12px;color:#6b7280">${clinic.email}</p>` : ''}
      ${clinic.gstin ? `<p style="font-size:11px;color:#6b7280;margin-top:4px">GSTIN: ${clinic.gstin}</p>` : ''}
    </div>
    <div style="text-align:right">
      <p style="font-size:28px;font-weight:900;color:#1e3a5f;letter-spacing:-.5px">INVOICE</p>
      <p style="font-size:16px;font-weight:700;color:#2563eb;margin:4px 0">${invoice.invoiceNumber}</p>
      ${statusBadge(invoice.status)}
    </div>
  </div>

  <!-- Divider -->
  <div style="height:2px;background:linear-gradient(90deg,#1e3a5f,#3b82f6,transparent);margin-bottom:24px;border-radius:1px"></div>

  <!-- Patient + Dates -->
  <div style="display:flex;justify-content:space-between;margin-bottom:24px">
    <div>
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:6px">Bill To</p>
      <p style="font-size:15px;font-weight:700;color:#1f2937">${invoice.patient?.firstName ?? ''} ${invoice.patient?.lastName ?? ''}</p>
      ${invoice.patient?.phone ? `<p style="font-size:12px;color:#6b7280">${invoice.patient.phone}</p>` : ''}
    </div>
    <div style="text-align:right">
      <p style="font-size:12px;color:#6b7280">Invoice Date: <strong style="color:#1f2937">${fmtDate(invoice.invoiceDate)}</strong></p>
      ${invoice.dueDate ? `<p style="font-size:12px;color:#6b7280;margin-top:4px">Due Date: <strong style="color:#1f2937">${fmtDate(invoice.dueDate)}</strong></p>` : ''}
    </div>
  </div>

  <!-- Items table -->
  <table style="margin-bottom:0">
    <thead>
      <tr style="background:#1e3a5f;color:#fff">
        <th style="text-align:left;border-radius:4px 0 0 4px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase">#</th>
        <th style="text-align:left;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Description</th>
        <th style="text-align:center;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Qty</th>
        <th style="text-align:right;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Unit Price</th>
        <th style="text-align:right;border-radius:0 4px 4px 0;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${(invoice.items ?? []).map((item, i) => `
      <tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'}">
        <td style="color:#9ca3af;font-size:12px">${i + 1}</td>
        <td style="font-weight:500">${item.description}</td>
        <td style="text-align:center;color:#6b7280">${item.quantity}</td>
        <td style="text-align:right;color:#6b7280">${fmt(item.unitPrice)}</td>
        <td style="text-align:right;font-weight:600">${fmt(item.totalAmount)}</td>
      </tr>`).join('')}
    </tbody>
    <tfoot>
      <tr style="border-top:1px solid #e5e7eb">
        <td colspan="3"></td>
        <td style="text-align:right;color:#6b7280;padding-top:10px">Subtotal</td>
        <td style="text-align:right;padding-top:10px">${fmt(invoice.subtotal)}</td>
      </tr>
      ${gstBlock}
      <tr style="border-top:2px solid #1e3a5f">
        <td colspan="3"></td>
        <td style="text-align:right;font-weight:800;font-size:15px;color:#1e3a5f;padding-top:8px">TOTAL</td>
        <td style="text-align:right;font-weight:800;font-size:15px;color:#1e3a5f;padding-top:8px">${fmt(invoice.totalAmount)}</td>
      </tr>
      ${paidBlock}
    </tfoot>
  </table>

  ${medsSection}

  ${invoice.notes ? `
  <div style="margin-top:24px;padding:12px 16px;background:#f0f9ff;border-left:3px solid #3b82f6;border-radius:4px">
    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#3b82f6;margin-bottom:4px">Notes</p>
    <p style="font-size:13px;color:#374151">${invoice.notes}</p>
  </div>` : ''}

  <!-- Footer -->
  <div style="margin-top:36px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">
    <p style="font-size:11px;color:#9ca3af">Generated by GotWell · ${new Date().toLocaleDateString('en-IN')}</p>
    <p style="font-size:11px;color:#9ca3af">Thank you for visiting ${clinic.name}</p>
  </div>

</div>

<script>window.onload=()=>{ window.print(); }</script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=820,height=900');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
