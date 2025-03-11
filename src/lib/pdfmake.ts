import pdfMake from 'pdfmake/build/pdfmake';

// Define the fonts object
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

// Initialize pdfMake with virtual font files
pdfMake.vfs = {};
pdfMake.fonts = fonts;

export default pdfMake;