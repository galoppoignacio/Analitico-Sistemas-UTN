
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { DatosMaterias } = require('../data/plan');

export function exportAnaliticoToPDF({ filename, stats, tableRows }: {
  filename: string,
  stats: { aprobadas: number, total: number, electivas: number, promedio: string, porcentaje: string },
  tableRows: Array<Array<string|number>>
}) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  let y = 48;
  pdf.setFontSize(30);
  pdf.setTextColor("#1976d2");
  pdf.text("Estadísticas académicas", pdf.internal.pageSize.getWidth()/2, y, { align: 'center' });
  y += 38;
  pdf.setFontSize(16);
  pdf.setTextColor("#222");
  pdf.text(`Materias aprobadas: ${stats.aprobadas}/${stats.total}`, 60, y);
  pdf.text(`Electivas aprobadas: ${stats.electivas}/7`, 340, y);
  pdf.text(`Promedio general: ${stats.promedio}`, 600, y);
  pdf.text(`Porcentaje completado: ${stats.porcentaje}%`, 860, y);
  y += 36;
  pdf.setFontSize(13);
  pdf.setTextColor("#222");
  // Procesar las filas para que la columna Nombre siempre use el nombre base de DatosMaterias
  const processedRows = tableRows.map(row => {
    // Si es fila de año, dejar igual
    if (typeof row[0] === 'string' && row[0].endsWith('º año')) return row;
    // Buscar el nombre base por id
    const id = row[0];
    const isElectiva = typeof row[1] === 'string' && row[1].includes('★');
    const materiaOriginal = DatosMaterias.find(mat => mat.id === id);
    const nombreBase = materiaOriginal ? materiaOriginal.nombre : row[1];
    return [
      id,
      nombreBase + (isElectiva ? ' * ' : ''),
      ...row.slice(2)
    ];
  });
  autoTable(pdf, {
    startY: y,
    head: [["ID", "Nombre", "Estado", "Nota", "Regulares", "Aprobadas"]],
    body: processedRows,
    styles: { fontSize: 13, cellPadding: 6, textColor: [34,34,34] },
    headStyles: { fillColor: [30,118,210], textColor: 255, fontStyle: 'bold', fontSize: 14 },
    alternateRowStyles: { fillColor: [246, 255, 247] },
    margin: { left: 20, right: 20 },
    theme: 'striped',
    didParseCell: function (data) {
      // Año: fondo celeste y texto más grande
      if (data.row.raw && typeof data.row.raw[0] === 'string') {
        const val = data.row.raw[0];
        if (val.endsWith('º año')) {
          data.cell.styles.fillColor = [227, 240, 255];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 15;
        }
      }
    },
    didDrawPage: (data) => {
      // Número de página
      const pageCount = pdf.getNumberOfPages();
      pdf.setFontSize(11);
      pdf.setTextColor("#888");
      pdf.text(`Página ${data.pageNumber} de ${pageCount}`, pdf.internal.pageSize.getWidth() - 120, pdf.internal.pageSize.getHeight() - 20);
    }
  });
  pdf.save(filename);
}
