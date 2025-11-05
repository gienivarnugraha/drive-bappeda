import { setVectorStore } from './app/utils/scripts/init'

async function run() {
    let file = "https://hwhq1hnvu4gvftjq.public.blob.vercel-storage.com/restjsonapis-120711135859-phpapp02.pdf'"

    await setVectorStore(file, {
        category_id: [16],
        division_id: [3],
        fileSize: 565062,
        extension: '.pdf',
        contentType: 'application/pdf',
        thumbnailSrc: 'https://hwhq1hnvu4gvftjq.public.blob.vercel-storage.com/restjsonapis-120711135859-phpapp02.png',
        filename: '7b9cef85a245dce081106795cab1e65b.pdf'
    })

}

run()