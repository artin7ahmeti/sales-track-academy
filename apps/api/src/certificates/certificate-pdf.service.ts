import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface CertificateData {
  userName: string;
  courseName: string;
  certificateNumber: string;
  issuedAt: Date;
}

@Injectable()
export class CertificatePdfService {
  async generate(data: CertificateData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: [842, 595], // A4 landscape
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const W = 842;
      const H = 595;

      // ── Background ──
      doc.rect(0, 0, W, H).fill('#FAFBFC');

      // ── Outer border ──
      const bm = 28; // border margin
      doc.lineWidth(2)
        .roundedRect(bm, bm, W - bm * 2, H - bm * 2, 8)
        .stroke('#1a1a2e');

      // Inner decorative border
      const im = 36;
      doc.lineWidth(0.5)
        .roundedRect(im, im, W - im * 2, H - im * 2, 6)
        .stroke('#004391');

      // ── Corner ornaments ──
      this.drawCornerOrnaments(doc, W, H);

      // ── Top decorative line ──
      const lineY = 80;
      doc.lineWidth(1.5)
        .moveTo(120, lineY).lineTo(W - 120, lineY)
        .stroke('#004391');

      // ── "of Achievement" ──
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#1a1a2e');
      const achieveLabel = 'Certificate of Achievement';
      const achieveW = doc.widthOfString(achieveLabel);
      doc.text(achieveLabel, (W - achieveW) / 2, 100, { lineBreak: false });

      // ── Decorative divider ──
      const divY = 145;
      doc.lineWidth(0.5)
        .moveTo(280, divY).lineTo(W - 280, divY)
        .stroke('#004391');
      // Small diamond in center
      const cx = W / 2;
      doc.save()
        .translate(cx, divY)
        .rotate(45)
        .rect(-3, -3, 6, 6)
        .fill('#004391')
        .restore();

      // ── "This is to certify that" ──
      doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#666666');
      const certifyText = 'This is to certify that';
      const certifyW = doc.widthOfString(certifyText);
      doc.text(certifyText, (W - certifyW) / 2, 170, { lineBreak: false });

      // ── Recipient name ──
      doc.fontSize(36)
        .font('Helvetica-Bold')
        .fillColor('#1a1a2e');
      const nameW = doc.widthOfString(data.userName);
      doc.text(data.userName, (W - nameW) / 2, 195, { lineBreak: false });

      // ── Name underline ──
      const nameUnderY = 242;
      doc.lineWidth(1)
        .moveTo(200, nameUnderY).lineTo(W - 200, nameUnderY)
        .stroke('#004391');

      // ── "has successfully completed" ──
      doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#666666');
      const completedText = 'has successfully completed all requirements for';
      const completedW = doc.widthOfString(completedText);
      doc.text(completedText, (W - completedW) / 2, 260, { lineBreak: false });

      // ── Course name ──
      doc.fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#1a1a2e');
      const courseW = doc.widthOfString(data.courseName);
      doc.text(data.courseName, (W - courseW) / 2, 285, { lineBreak: false });

      // ── "on SalesTrack Academy" ──
      doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#666666');
      const platformText = 'on SalesTrack Academy';
      const platformW = doc.widthOfString(platformText);
      doc.text(platformText, (W - platformW) / 2, 320, { lineBreak: false });

      // ── Issue date & Certificate number ──
      const footerY = 400;

      // Date section (left)
      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#999999');
      doc.text('DATE OF ISSUE', 160, footerY, { width: 160, align: 'center' });
      doc.lineWidth(0.5)
        .moveTo(180, footerY + 14).lineTo(300, footerY + 14)
        .stroke('#cccccc');
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1a1a2e');
      const dateStr = data.issuedAt.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      doc.text(dateStr, 160, footerY + 22, { width: 160, align: 'center' });

      // Seal/badge in center
      this.drawSeal(doc, cx, footerY + 30);

      // Certificate number (right)
      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#999999');
      doc.text('CERTIFICATE NO.', W - 320, footerY, { width: 160, align: 'center' });
      doc.lineWidth(0.5)
        .moveTo(W - 300, footerY + 14).lineTo(W - 180, footerY + 14)
        .stroke('#cccccc');
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#1a1a2e');
      doc.text(data.certificateNumber, W - 320, footerY + 22, { width: 160, align: 'center' });

      // ── Bottom decorative line ──
      const bottomLineY = H - 80;
      doc.lineWidth(1.5)
        .moveTo(120, bottomLineY).lineTo(W - 120, bottomLineY)
        .stroke('#004391');

      // ── Footer text ──
      doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#aaaaaa');
      const footerText = 'SalesTrack Academy  |  Verified Digital Certificate';
      const ftW = doc.widthOfString(footerText);
      doc.text(footerText, (W - ftW) / 2, bottomLineY + 12, { lineBreak: false });

      doc.end();
    });
  }

  private drawCornerOrnaments(doc: PDFKit.PDFDocument, W: number, H: number) {
    const size = 18;
    const offset = 42;
    const color = '#004391';

    // Top-left
    doc.lineWidth(1.5)
      .moveTo(offset, offset + size).lineTo(offset, offset).lineTo(offset + size, offset)
      .stroke(color);

    // Top-right
    doc.moveTo(W - offset - size, offset).lineTo(W - offset, offset).lineTo(W - offset, offset + size)
      .stroke(color);

    // Bottom-left
    doc.moveTo(offset, H - offset - size).lineTo(offset, H - offset).lineTo(offset + size, H - offset)
      .stroke(color);

    // Bottom-right
    doc.moveTo(W - offset - size, H - offset).lineTo(W - offset, H - offset).lineTo(W - offset, H - offset - size)
      .stroke(color);
  }

  private drawSeal(doc: PDFKit.PDFDocument, cx: number, cy: number) {
    // Outer circle
    doc.lineWidth(2)
      .circle(cx, cy, 30)
      .stroke('#004391');

    // Inner circle
    doc.lineWidth(0.5)
      .circle(cx, cy, 24)
      .stroke('#004391');

    // Star-like shape
    const points = 8;
    const outerR = 18;
    const innerR = 10;
    doc.save().translate(cx, cy);
    doc.moveTo(0, -outerR);
    for (let i = 0; i < points; i++) {
      const outerAngle = (i * 2 * Math.PI) / points - Math.PI / 2;
      const innerAngle = ((i + 0.5) * 2 * Math.PI) / points - Math.PI / 2;
      doc.lineTo(Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR);
      doc.lineTo(Math.cos(innerAngle) * innerR, Math.sin(innerAngle) * innerR);
    }
    doc.closePath().fill('#004391');
    doc.restore();

    // Checkmark in center
    doc.save().translate(cx, cy);
    doc.lineWidth(2.5)
      .moveTo(-6, 0).lineTo(-2, 5).lineTo(7, -5)
      .stroke('#FAFBFC');
    doc.restore();
  }
}
