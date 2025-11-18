import { tables, useDrizzle } from '~~/server/utils/drizzle';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from "drizzle-orm/node-postgres";
//@ts-ignore
import bcrypt from 'bcrypt';
import { convertToMarkdown } from './convert';

async function run() {

    console.error('⏳ Starting migrations...');

    const db = useDrizzle()

    try {
        await migrate(db, { migrationsFolder: './drizzle' });

        console.error('Running DB seed task...')


        const saltRounds = 2;

        const password = await bcrypt.hash('password123', saltRounds);

        console.error(password)
        const users = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: password.toString(),
                avatar: 'b7b8e6e3-7ed0-4626-8311-ab4addcb2040.png',
            },
        ]

        const categories = [
            { name: "pendidikan", metadata: { display_name: "Pendidikan" } },
            { name: "kesehatan", metadata: { display_name: "Kesehatan" } },
            { name: "pekerjaan_umum_dan_penataan_ruang", metadata: { display_name: "Pekerjaan Umum dan Penataan Ruang" } },
            { name: "perumahan_dan_kawasan_permukiman", metadata: { display_name: "Perumahan dan Kawasan Permukiman" } },
            { name: "ketenteraman_dan_ketertiban_umum_serta_perlindungan_masyarakat", metadata: { display_name: "Ketenteraman dan Ketertiban Umum serta Perlindungan Masyarakat" } },
            { name: "sosial", metadata: { display_name: "Sosial" } },
            { name: "tenaga_kerja", metadata: { display_name: "Tenaga Kerja" } },
            { name: "pemberdayaan_perempuan_dan_perlindungan_anak", metadata: { display_name: "Pemberdayaan Perempuan dan Perlindungan Anak" } },
            { name: "pangan", metadata: { display_name: "Pangan" } },
            { name: "pertanahan", metadata: { display_name: "Pertanahan" } },
            { name: "lingkungan_hidup", metadata: { display_name: "Lingkungan Hidup" } },
            { name: "administrasi_kependudukan_dan_pencatatan_sipil", metadata: { display_name: "Administrasi Kependudukan dan Pencatatan Sipil" } },
            { name: "pemberdayaan_masyarakat_dan_desa", metadata: { display_name: "Pemberdayaan Masyarakat dan Desa" } },
            { name: "pengendalian_penduduk_dan_keluarga_berencana", metadata: { display_name: "Pengendalian Penduduk dan Keluarga Berencana" } },
            { name: "perhubungan", metadata: { display_name: "Perhubungan" } },
            { name: "komunikasi_dan_informatika", metadata: { display_name: "Komunikasi dan Informatika" } },
            { name: "koperasi_usaha_kecil_dan_menengah", metadata: { display_name: "Koperasi Usaha Kecil dan Menengah" } },
            { name: "penanaman_modal", metadata: { display_name: "Penanaman Modal" } },
            { name: "kepemudaan_dan_olahraga", metadata: { display_name: "Kepemudaan dan Olahraga" } },
            { name: "statistik", metadata: { display_name: "Statistik" } },
            { name: "persandian", metadata: { display_name: "Persandian" } },
            { name: "kebudayaan", metadata: { display_name: "Kebudayaan" } },
            { name: "perpustakaan", metadata: { display_name: "Perpustakaan" } },
            { name: "kearsipan", metadata: { display_name: "Kearsipan" } },
            { name: "kelautan_dan_perikanan", metadata: { display_name: "Kelautan dan Perikanan" } },
            { name: "pariwisata", metadata: { display_name: "Pariwisata" } },
            { name: "pertanian", metadata: { display_name: "Pertanian" } },
            { name: "kehutanan", metadata: { display_name: "Kehutanan" } },
            { name: "energi_dan_sumber_daya_mineral", metadata: { display_name: "Energi dan Sumber Daya Mineral" } },
            { name: "perdagangan", metadata: { display_name: "Perdagangan" } },
            { name: "perindustrian", metadata: { display_name: "Perindustrian" } },
            { name: "transmigrasi", metadata: { display_name: "Transmigrasi" } },
            { name: "perencanaan", metadata: { display_name: "Perencanaan" } }
        ]

        const divisions = [
            { name: 'pemerintahan', metadata: { display_name: 'Pemerintahan' } },
            { name: 'kesehatan_masyarakat', metadata: { display_name: 'Kesehatan Masyarakat' } },
            { name: 'ekonomi', metadata: { display_name: 'Ekonomi' } },
            { name: 'sumber_daya_alam', metadata: { display_name: 'Sumber Daya Alam' } },
            { name: 'infrastruktur', metadata: { display_name: 'Infrastruktur' } },
            { name: 'kewilayahan', metadata: { display_name: 'Kewilayahan' } },
            { name: 'ppe', metadata: { display_name: 'PPE' } },
            { name: 'pemberdayaan manusia', metadata: { display_name: 'Pemberdayaan Manusia' } },
        ]


        await useDrizzle().insert(tables.categories).values(categories).onConflictDoNothing({ target: tables.categories.name })

        await useDrizzle().insert(tables.divisions).values(divisions).onConflictDoNothing({ target: tables.divisions.name })

        await useDrizzle().insert(tables.users).values(users).onConflictDoNothing({ target: tables.users.email })

        return { result: 'success' }

    } catch (error) {
        console.error('Script terminated due to error.', error);
        process.exit(1);
    } finally {
        await db.$client.end(); // Always close the pool when done
    }
}

// async function convert() {
//     await convertToMarkdown('github-git-cheat-sheet.pdf')

// }
// convert().then((result) => console.error(result)).catch(err => console.error(err))

run().then((result) => console.error(result))

