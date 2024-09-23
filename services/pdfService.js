const PDFDocument = require('pdfkit');

exports.generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Add content to PDF
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${order.createdAt.toDateString()}`);
    doc.moveDown();
    order.items.forEach(item => {
      doc.text(`${item.name} - $${item.price}`);
    });
    doc.moveDown();
    doc.fontSize(14).text(`Total Amount: $${order.totalAmount}`);

    doc.end();
  });
};

exports.generateCombinedInvoice = (orders) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Add content to PDF
    doc.fontSize(20).text('Combined Invoice', { align: 'center' });
    doc.moveDown();

    let totalAmount = 0;

    orders.forEach((order, index) => {
      doc.fontSize(16).text(`Order ${index + 1}`, { underline: true });
      doc.fontSize(12).text(`Order ID: ${order._id}`);
      doc.text(`Date: ${order.createdAt.toDateString()}`);
      doc.moveDown();

      order.items.forEach(item => {
        doc.text(`${item.name} - $${item.price}`);
      });

      doc.fontSize(14).text(`Order Total: $${order.totalAmount}`);
      doc.moveDown();

      totalAmount += order.totalAmount;
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total Amount for All Orders: $${totalAmount}`, { bold: true });

    doc.end();
  });
};