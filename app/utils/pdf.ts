export const generateThumbnail = async (data: Uint8Array) => {
  const pdfjsLib = await import('pdfjs-dist')

  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

    const worker = new pdfjsLib.PDFWorker()

    const load = pdfjsLib.getDocument({ data, worker })

    const pdf = await load.promise

    const page = await pdf.getPage(1)

    const viewport = page.getViewport({ scale: 1 })

    const canvas = document.createElement('canvas')

    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width

    // @ts-ignore
    await page.render({ canvasContext: context, viewport: viewport }).promise

    return canvas
  } catch (error) {
    console.error('generate canvas', error)
  }
}
