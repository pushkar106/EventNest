const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  const qrData = JSON.stringify(data);
  return await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
};

module.exports = { generateQRCode };
