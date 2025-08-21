// Declaraciones para pdfjs-dist en Next.js
// Permite importar pdfjs-dist/build/pdf y pdf.worker.entry sin error de TypeScript
declare module 'pdfjs-dist/build/pdf' {
  const pdfjs: any;
  export = pdfjs;
}
declare module 'pdfjs-dist/build/pdf.worker.entry' {
  const worker: any;
  export default worker;
}
