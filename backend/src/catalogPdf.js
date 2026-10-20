import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export async function generateCatalogPdf(db, res) {
  // 1. Fetch site settings
  let settings = {
    company_name: 'CV. Restu Bumi Bersama',
    address: 'Ngampel, Kabupaten Madiun, Jawa Timur, Indonesia',
    phone: '+62 812-3456-7890',
    whatsapp: '6281234567890',
    email: 'info@restubumibersama.co.id',
  };
  try {
    const [settingsRows] = await db.query('SELECT * FROM site_settings ORDER BY id DESC LIMIT 1');
    if (settingsRows && settingsRows[0]) {
      settings = { ...settings, ...settingsRows[0] };
    }
  } catch (err) {
    console.error('Error fetching settings for PDF:', err);
  }

  // 2. Fetch active products grouped by category
  const [products] = await db.query(`
    SELECT p.id, p.name, p.price, p.spec_id, p.spec_en, p.sort_order,
           pc.id AS category_id,
           COALESCE(pc.label_id, 'Kategori Lainnya') AS category_name,
           COALESCE(pc.sort_order, 999) AS cat_sort_order
    FROM products p
    LEFT JOIN product_categories pc ON p.category_id = pc.id
    WHERE p.is_active = 1
    ORDER BY cat_sort_order ASC, pc.id ASC, p.sort_order ASC, p.id ASC
  `);

  // Group products by category
  const grouped = new Map();
  for (const p of products) {
    const catName = p.category_name || 'Kategori Lainnya';
    if (!grouped.has(catName)) {
      grouped.set(catName, []);
    }
    grouped.get(catName).push(p);
  }

  // Set HTTP response headers
  const todayStr = new Date().toISOString().slice(0, 10);
  const filename = `Katalog-Produk-CV-Restu-Bumi-Bersama-${todayStr}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Create PDFKit document
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 50, left: 45, right: 45 },
    bufferPages: true,
  });

  doc.pipe(res);

  const primaryColor = '#D42027'; // Brand red
  const textDark = '#1A1A1A';
  const textMuted = '#555555';
  const borderColor = '#E5E7EB';
  const pageInnerWidth = 595.28 - 90; // A4 width 595.28 - margins 45*2 = 505.28

  // Helper for drawing header on page
  const drawHeader = () => {
    // Top primary accent stripe
    doc.rect(0, 0, 595.28, 5).fill(primaryColor);

    const logoPath = path.resolve(process.cwd(), '../public/RBB.png');
    let headerTextX = 45;

    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 45, 20, { width: 44, height: 44 });
        headerTextX = 98;
      } catch (e) {
        console.error('Failed to load logo in PDF:', e);
      }
    }

    doc
      .fillColor(textDark)
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(settings.company_name || 'CV. Restu Bumi Bersama', headerTextX, 22);

    doc
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('KONTRAKTOR & SUPPLIER BAHAN BANGUNAN', headerTextX, 39);

    doc
      .fillColor(textMuted)
      .font('Helvetica')
      .fontSize(7.5)
      .text(
        `${settings.address || 'Madiun, Jawa Timur'} • Telp/WA: ${settings.phone || settings.whatsapp || '-'} • Email: ${settings.email || '-'}`,
        headerTextX,
        50,
        { width: 330 },
      );

    // Right-aligned Title & Date Badge
    const rightBoxX = 430;
    const rightBoxW = 120;
    doc
      .roundedRect(rightBoxX, 20, rightBoxW, 44, 4)
      .fillAndStroke('#FEF2F2', '#FECACA');

    doc
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .text('KATALOG PRODUK', rightBoxX, 26, { width: rightBoxW, align: 'center' });

    const formattedDate = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());

    doc
      .fillColor(textDark)
      .font('Helvetica')
      .fontSize(7.5)
      .text(`Per ${formattedDate}`, rightBoxX, 39, { width: rightBoxW, align: 'center' });

    doc
      .fillColor(textMuted)
      .font('Helvetica')
      .fontSize(7)
      .text(`${products.length} Item Aktif`, rightBoxX, 50, { width: rightBoxW, align: 'center' });

    // Divider line
    doc.strokeColor(borderColor).lineWidth(1).moveTo(45, 74).lineTo(550.28, 74).stroke();

    doc.y = 82;
  };

  // Draw Header on first page
  drawHeader();

  // Intro notice box
  const introY = doc.y;
  doc
    .roundedRect(45, introY, pageInnerWidth, 28, 4)
    .fillAndStroke('#F9FAFB', '#E5E7EB');

  doc
    .fillColor('#374151')
    .font('Helvetica')
    .fontSize(7.5)
    .text(
      'Informasi katalog ini diperbarui secara otomatis dari basis data produk CV. Restu Bumi Bersama. Ketersediaan stok dan harga penawaran resmi dapat dikonfirmasikan lebih lanjut melalui kontak kami.',
      55,
      introY + 6,
      { width: pageInnerWidth - 20, lineGap: 2 },
    );

  doc.y = introY + 36;

  // Render Table Columns layout
  const colNo = 26;
  const colPrice = 90;
  const remainingW = pageInnerWidth - colNo - colPrice;
  const colName = Math.floor(remainingW * 0.45);
  const colSpec = remainingW - colName;

  const colX_No = 45;
  const colX_Name = colX_No + colNo;
  const colX_Spec = colX_Name + colName;
  const colX_Price = colX_Spec + colSpec;

  const drawTableHeader = () => {
    const y = doc.y;
    doc.rect(45, y, pageInnerWidth, 18).fill('#F3F4F6');

    doc.fillColor('#374151').font('Helvetica-Bold').fontSize(8);
    doc.text('No', colX_No, y + 5, { width: colNo, align: 'center' });
    doc.text('Nama Produk', colX_Name + 4, y + 5, { width: colName - 8 });
    doc.text('Spesifikasi / Keterangan', colX_Spec + 4, y + 5, { width: colSpec - 8 });
    doc.text('Harga / Satuan', colX_Price, y + 5, { width: colPrice - 6, align: 'right' });

    doc.strokeColor(borderColor).lineWidth(0.5).moveTo(45, y + 18).lineTo(550.28, y + 18).stroke();
    doc.y = y + 19;
  };

  let globalIndex = 1;

  if (grouped.size === 0) {
    doc.moveDown(2);
    doc.fillColor(textMuted).font('Helvetica').fontSize(10).text('Belum ada produk aktif yang tersedia.', { align: 'center' });
  } else {
    for (const [catName, catProducts] of grouped.entries()) {
      // Check if we need a new page for category title + table header + at least 1 row
      if (doc.y > doc.page.height - 120) {
        doc.addPage();
        drawHeader();
      }

      // Category banner
      doc.moveDown(0.6);
      const catY = doc.y;
      doc.roundedRect(45, catY, pageInnerWidth, 20, 3).fill('#FEE2E2');
      doc.rect(45, catY, 4, 20).fill(primaryColor);

      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9);
      doc.text(catName.toUpperCase(), 56, catY + 5);

      doc.fillColor('#991B1B').font('Helvetica').fontSize(7.5);
      doc.text(`(${catProducts.length} Produk)`, 45 + pageInnerWidth - 75, catY + 6, { width: 70, align: 'right' });

      doc.y = catY + 24;

      drawTableHeader();

      for (let i = 0; i < catProducts.length; i++) {
        const p = catProducts[i];
        const specText = (p.spec_id || p.spec_en || '—').trim();
        const priceText = (p.price && p.price.trim()) ? p.price.trim() : 'Hubungi Kami';

        // Calculate needed height for this row
        doc.font('Helvetica').fontSize(8);
        const nameH = doc.heightOfString(p.name, { width: colName - 8 });
        const specH = doc.heightOfString(specText, { width: colSpec - 8 });
        const rowHeight = Math.max(18, Math.max(nameH, specH) + 10);

        // Check if page break needed
        if (doc.y + rowHeight > doc.page.height - 65) {
          doc.addPage();
          drawHeader();
          drawTableHeader();
        }

        const rowY = doc.y;

        // Alternating row background
        if (i % 2 === 1) {
          doc.rect(45, rowY, pageInnerWidth, rowHeight).fill('#FBFBFC');
        }

        // Draw Row Data
        doc.fillColor(textMuted).font('Helvetica').fontSize(7.5);
        doc.text(String(globalIndex++), colX_No, rowY + 5, { width: colNo, align: 'center' });

        doc.fillColor(textDark).font('Helvetica-Bold').fontSize(8);
        doc.text(p.name, colX_Name + 4, rowY + 5, { width: colName - 8 });

        doc.fillColor('#4B5563').font('Helvetica').fontSize(7.5);
        doc.text(specText, colX_Spec + 4, rowY + 5, { width: colSpec - 8 });

        if (priceText === 'Hubungi Kami') {
          doc.fillColor('#6B7280').font('Helvetica-Oblique').fontSize(7.5);
        } else {
          doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8);
        }
        doc.text(priceText, colX_Price, rowY + 5, { width: colPrice - 6, align: 'right' });

        // Row border
        doc.strokeColor('#F3F4F6').lineWidth(0.5).moveTo(45, rowY + rowHeight).lineTo(550.28, rowY + rowHeight).stroke();

        doc.y = rowY + rowHeight;
      }
    }
  }

  // Add Footers and page numbers to all buffered pages
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);

    const footerY = doc.page.height - 35;
    doc.strokeColor(borderColor).lineWidth(0.5).moveTo(45, footerY).lineTo(550.28, footerY).stroke();

    doc.fillColor('#9CA3AF').font('Helvetica').fontSize(7);
    doc.text(
      'CV. Restu Bumi Bersama • Dokumen Resmi Katalog Material & Konstruksi',
      45,
      footerY + 6,
      { width: 350 },
    );

    doc.text(
      `Halaman ${i + 1} dari ${totalPages}`,
      400,
      footerY + 6,
      { width: 150.28, align: 'right' },
    );
  }

  doc.end();
}
