import { setVectorStore } from './app/utils/scripts/init'

async function run() {
    let file = "https://hwhq1hnvu4gvftjq.public.blob.vercel-storage.com/17-teknik-closing.pdf"

    await setVectorStore(file, {
        category_id: [16],
        division_id: [3],
        fileSize: 565062,
        extension: '.pdf',
        contentType: 'application/pdf',
        thumbnailSrc: 'https://hwhq1hnvu4gvftjq.public.blob.vercel-storage.com/17-teknik-closing.png',
        filename: '7b9cef85a245dce081106795cab1e65b.pdf'
    })

}

run()