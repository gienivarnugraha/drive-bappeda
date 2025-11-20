<script setup lang="ts">

const { loggedIn } = useUserSession()

const features = [
  {
    icon: 'i-lucide-folder',
    title: 'Warehouse Data Sentral Berbasis AI',
    description: 'Konsolidasikan seluruh dokumen perencanaan, laporan, dan data historis Anda dalam satu Data Warehouse. Akses mudah, kontrol penuh.',
  },
  {
    icon: 'i-lucide-message-square',
    title: 'Asisten Wawasan Semantik (Chatbot)',
    description: 'Ajukan pertanyaan kompleks pada ribuan dokumen sekaligus dalam bahasa alami. Dapatkan ringkasan cerdas, kutipan langsung, dan data kunci yang instan dan kontekstual.',
  },
  {
    icon: 'i-lucide-search',
    title: 'Pencarian Data Hiper-Presisi',
    description: 'Temukan informasi tersembunyi di antara tumpukan dokumen dengan fitur pencarian semantik dan filtering canggih. Hemat ratusan jam kerja pencarian manual.',
  },
  {
    icon: 'i-lucide-cloud',
    title: 'Injeksi Data Seamless & Terproteksi',
    description: 'Integrasikan data Anda (PDF, DOCX, CSV, MD, TXT) dengan mulus ke dalam Data Warehouse. Data Anda dijamin utuh, aman, dan siap query dalam hitungan menit.',
  }
]

const steps = [
  {
    icon: 'i-lucide-upload-cloud',
    title: 'Unggah Sumber Kebijakan',
    description: 'Unggah dokumen perencanaan (Rendab, RKPD, dll.) langsung ke Warehouse BAPPEDA Terenkripsi Anda.'
  },
  {
    icon: 'i-lucide-brain',
    title: 'Transformasi Wawasan oleh AI',
    description: 'Teknologi AI Semantik kami akan membaca, mengindeks, dan memetakan setiap baris data, menjadikannya siap untuk di-query cerdas.'
  },
  {
    icon: 'i-lucide-message-circle-question',
    title: 'Aktivasi Asisten Analisis Anda',
    description: 'Gunakan Chatbot untuk mengajukan pertanyaan strategis seperti "Apa proyek prioritas untuk peningkatan IPM di sektor pendidikan 2025?".'
  },
  {
    icon: 'i-lucide-check-circle',
    title: 'Keputusan Berbasis Bukti Nyata',
    description: 'Dapatkan jawaban instan, akurat, dan terverifikasi dengan kutipan dokumen yang jelas, mempercepat perumusan kebijakan yang berdampak.'
  }
]

const faqs = [
  {
    label: 'Apa itu Warehouse Data BAPPEDA?',
    icon: 'i-lucide-database',
    content: 'Warehouse Data BAPPEDA adalah repositori data berbasis cloud yang dirancang khusus untuk menyimpan, mengelola, dan menganalisis semua dokumen dan data terkait perencanaan pembangunan regional, dengan fokus pada keamanan dan aksesibilitas.'
  },
  {
    label: 'Format dokumen apa saja yang didukung?',
    icon: 'i-lucide-file-text',
    content: 'Saat ini kami mendukung file berbasis teks dan data tabular utama: PDF, Microsoft Word (.doc, .docx), Excel Data (.csv), Markdown (.md), dan Teks biasa (.txt). Kami fokus pada format yang relevan untuk dokumen kebijakan dan data kinerja.'
  },
  {
    label: 'Seberapa cepat saya bisa mendapatkan jawaban dari Chatbot?',
    icon: 'i-lucide-clock',
    content: 'Setelah dokumen diunggah dan diproses, Chatbot dapat memberikan jawaban dalam hitungan detik hingga menit, tergantung pada kompleksitas pertanyaan dan jumlah dokumen yang dianal'
  },
  {
    label: 'Apakah Chatbot dapat memberikan referensi sumber?',
    icon: 'i-lucide-quote',
    content: 'Ya. Setiap jawaban yang diberikan oleh Chatbot dilengkapi dengan kutipan yang menunjukkan dari dokumen mana (beserta nomor halaman/paragrafnya) informasi tersebut ditarik, menjamin transparansi dan verifikasi.'
  }
]

const testimonials = [
  {
    quote: 'Waktu yang kami habiskan untuk mencari data di tumpukan dokumen kini dapat digunakan 100% untuk analisis. Ini revolusioner untuk efisiensi tim kami.',
    name: 'Dr. Rina W.',
    title: 'Kepala Bidang Perencanaan',
    avatar: { src: 'https://i.pravatar.cc/150?img=11' }
  },
  {
    quote: 'Kemampuan untuk menanyakan isi ratusan dokumen sekaligus adalah terobosan. Akurasi data untuk rapat koordinasi meningkat drastis.',
    name: 'Ir. Budi S.',
    title: 'Staf Ahli Pembangunan',
    avatar: { src: 'https://i.pravatar.cc/150?img=14' }
  },
  {
    quote: 'Proses injeksi data sangat mudah, dan yang paling penting, aman. Kami merasa percaya diri dengan integritas data kami di Warehouse Data ini.',
    name: 'Santi P.',
    title: 'Analis Data Senior',
    avatar: { src: 'https://i.pravatar.cc/150?img=17' }
  },
  {
    quote: 'Integrasi dengan data dari berbagai OPD (Organisasi Perangkat Daerah) kini jauh lebih cepat. Ini menciptakan kolaborasi data yang sesungguhnya.',
    name: 'Faisal A.',
    title: 'Koordinator Integrasi Data',
    avatar: { src: 'https://i.pravatar.cc/150?img=18' }
  },
  {
    quote: 'Kami dapat menyusun Laporan Kinerja (LAKIP) dalam waktu singkat. Semua data referensi sudah terkueri dan tersaji secara akurat. Alat yang wajib dimiliki.',
    name: 'Dewi K.',
    title: 'Sekretaris BAPPEDA',
    avatar: { src: 'https://i.pravatar.cc/150?img=19' }
  }
]

const logos = [
  { src: 'logos_1.png', alt: 'Kota Semarang' },
  { src: 'logos_2.png', alt: 'Badan Pembangungan Daerah Kota Semarang' },
  { src: 'logos_3.webp', alt: 'Sistem Informasi Pemerintah Daerah' },
  { src: 'logos_4.png', alt: 'Sistem Informasi Kerjasama Antar Lembaga' },
  { src: 'logos_5.png', alt: 'Lapor SEMAR' },
]

const links = [
  {
    label: 'Akses Sekarang',
    to: '/login',
    icon: 'i-lucide-rocket',
  },
  {
    label: 'Cara Kerja',
    to: '#how-it-works',
    color: 'neutral' as const,
    variant: 'subtle' as const,
    trailingIcon: 'i-lucide-arrow-right'
  }
]
const { smAndLarger } = useTailwindBreakpoints()
</script>

<template>
  <UApp>
    <UHeader :toggle="false" :class="{ 'border-b border-gray-200 dark:border-gray-800': loggedIn }">
      <template #title>
        <div class="flex flex-row space-x-2 items-center">
          <ClientOnly v-if="loggedIn" class="w-fit">
            <UButton variant="subtle" color="neutral" icon="i-lucide-chevron-left" to="/home" />
            <template #fallback>
              <USkeleton class="h-8 w-8" />
            </template>
          </ClientOnly>

          <Logo />
        </div>
      </template>
      <template #right>
        <UColorModeButton />

        <ClientOnly v-if="loggedIn" class="w-fit">
          <UserMenu />
          <template #fallback>
            <USkeleton class="h-8 w-24" />
          </template>
        </ClientOnly>
        <div v-else>
          <UButton icon="i-lucide-arrow-right" color="primary" variant="solid" to="/login">{{ smAndLarger ? 'Login' : ''
          }}
          </UButton>
        </div>
      </template>
    </UHeader>

    <div class="fixed top-[35vh] w-full h-[30vh] bg-radial-gradient blur-[180px] opacity-60 z-[-1]">
    </div>

    <UMain class="flex-1 space-y-32">
      <UPageHero id="hero" title="Akselerasi Pengambilan Keputusan, Tingkatkan Akurasi Perencanaan"
        description="Hentikan pencarian manual yang memakan waktu. Gunakan Chatbot AI Data Warehouse untuk mendapatkan wawasan spesifik dari ribuan dokumen pembangunan daerah dalam hitungan detik."
        headline="BADAN PERENCANAAN PEMBANGUNAN DAERAH" :links="links">

        <template #top>
          <LazyHeroBackground />
          <LazyHeroStars />
        </template>

        <UCard class="mt-16 relative aspect-video md:aspect-2/1 overflow-hidden"
          :ui="{ body: 'p-0', root: 'ring-0 shadow-2xl' }">

          <UColorModeImage light="hero_light.png" dark="hero_dark.png" class="w-full h-full object-cover"
            alt="Tampilan antarmuka Chatbot AI" />

        </UCard>
      </UPageHero>

      <UPageLogos id="logos" title="Bagian dari kami" :marquee="{ pauseOnHover: true }">
        <img v-for="(logo, index) in logos" :key="index" :src="logo.src" class="h-12 w-auto" />
      </UPageLogos>

      <UPageSection id="features" title="Dari Tumpukan Dokumen Menjadi Sumber Wawasan Cepat"
        description="Fitur-fitur revolusioner yang dirancang khusus untuk mempercepat siklus perencanaan dan analisis Pembangunan Daerah."
        headline="SOLUSI DATA REVOLUSIONER" icon="i-lucide-layout-grid">

        <UPageGrid :ui="{ base: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' }">
          <UPageCard v-for="(feature, index) in features" :key="index" v-bind="feature" spotlight
            :ui="{ header: 'h-10 w-10' }" />
        </UPageGrid>
      </UPageSection>

      <UPageSection id="how-it-works" title="Memulai Analisis Cerdas Semudah Mengklik"
        description="Kami merancang alur kerja yang intuitif agar tim BAPPEDA dapat langsung fokus pada hasil, bukan proses teknis."
        headline="PROSES 4 LANGKAH SEDERHANA" icon="i-lucide-circle-star">

        <div class="grid grid-cols-1 gap-y-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-12">
          <div v-for="(step, index) in steps" :key="index" class="relative flex flex-col items-center text-center">

            <div v-if="index < steps.length - 1"
              class="hidden lg:block absolute top-7 right-0 w-3/4 h-0.5 bg-primary-500/50 transform translate-x-5/8 z-0">
            </div>

            <div v-if="index < steps.length - 1"
              class="lg:hidden absolute bottom-0 left-1/2 w-0.5 h-1/5 bg-primary-500/50 transform translate-y-full -translate-x-1/2 z-0">
            </div>

            <div class="z-10 flex flex-col items-center">
              <div class="w-16 h-16 flex items-center justify-center rounded-full border-4 mb-4 relative z-10"
                :class="`border-primary-500 bg-primary-500/10 dark:bg-primary-400/10`">
                <UIcon :name="step.icon" class="w-8 h-8 text-primary-500" />
              </div>
              <h3 class="text-3xl font-bold text-primary mb-2">{{ index + 1 }}</h3>
              <h4 class="text-xl font-semibold mb-2">{{ step.title }}</h4>
              <p class="text-gray-500 dark:text-gray-400">{{ step.description }}</p>
            </div>
          </div>
        </div>

      </UPageSection>


      <UPageSection id="testimonials" title="Efisiensi yang Terbukti di Lapangan"
        description="Apa Kata Pengguna BAPPEDA" icon="i-lucide-users">
        <UPageColumns>
          <UPageCard v-for="(testimonial, index) in testimonials" :key="index" :description="testimonial.quote"
            :ui="{ description: 'text-lg italic before:content-[open-quote] after:content-[close-quote] text-gray-700 dark:text-gray-300' }">
            <template #footer>
              <div class="flex items-center">
                <UAvatar v-bind="testimonial.avatar" size="lg" alt="Avatar" class="mr-4" />
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ testimonial.name }}</p>
                  <p class="text-sm text-primary-600 dark:text-primary-400">{{ testimonial.title }}</p>
                </div>
              </div>
            </template>
          </UPageCard>
        </UPageColumns>
      </UPageSection>

      <UPageSection id="faq" title="Pertanyaan yang Paling Sering Diajukan"
        description="Masih ragu? Temukan jawaban atas pertanyaan umum seputar keamanan data, dukungan format, dan cara kerja Chatbot."
        orientation="horizontal" icon="i-lucide-help-circle">

        <UAccordion :items="faqs" color="primary" variant="subtle" class="space-y-4">

        </UAccordion>

      </UPageSection>


      <UPageCTA title="Ubah Data Menjadi Kekuatan Penggerak Pembangunan"
        description="Tinggalkan cara lama. Mulai percepat proses perencanaan dan pengambilan keputusan BAPPEDA Anda hari ini."
        orientation="horizontal" :links="links">
        <LazyHeroStars />
      </UPageCTA>
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          &copy; {{ new Date().getFullYear() }} Data Insight BAPPEDA. Semua Hak Dilindungi.
        </p>
      </template>

      <template #right>
        <UButton aria-label="Kebijakan Privasi" to="#" target="_blank" variant="link" label="Kebijakan Privasi" />
        <UButton aria-label="Ketentuan Layanan" to="#" target="_blank" variant="link" label="Ketentuan Layanan" />
      </template>
    </UFooter>
  </UApp>
</template>