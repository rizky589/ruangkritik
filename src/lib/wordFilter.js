// ─── Daftar kata kasar / toxic (Indonesia + umum) ───────────
const BANNED_WORDS = [
  // SARA & hate speech
  'bangsat', 'anjing', 'babi', 'bajingan', 'keparat', 'bedebah',
  'kontol', 'memek', 'ngentot', 'jancok', 'dancok', 'cok',
  'goblok', 'tolol', 'idiot', 'bodoh', 'dungu', 'tai', 'tahi',
  'brengsek', 'kampret', 'setan', 'iblis', 'laknat',
  'sialan', 'asu', 'celeng', 'monyet', 'kunyuk',
  // spam patterns
  'click here', 'free money', 'wa.me', 'bit.ly',
  // common toxic english
  'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'damn', 'cunt',
  'nigger', 'faggot',
]

// ─── Sensor kata dengan bintang ────────────────────────────
function censorWord(word) {
  if (word.length <= 2) return '***'
  return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1]
}

// ─── Cek apakah teks mengandung kata kasar ─────────────────
export function containsBannedWords(text) {
  if (!text) return false
  const lower = text.toLowerCase()
  return BANNED_WORDS.some(word => lower.includes(word.toLowerCase()))
}

// ─── Filter: sensor kata kasar di teks ─────────────────────
export function filterContent(text) {
  if (!text) return text
  let result = text
  BANNED_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi')
    result = result.replace(regex, censorWord(word))
  })
  return result
}

// ─── Validasi sebelum submit (throw error jika terlalu banyak) ─
export function validateContent(text, fieldName = 'Konten') {
  if (!text || !text.trim()) {
    throw new Error(`${fieldName} tidak boleh kosong!`)
  }
  if (text.trim().length < 10) {
    throw new Error(`${fieldName} terlalu pendek (minimal 10 karakter)`)
  }
  // Hitung jumlah kata kasar
  const lower = text.toLowerCase()
  const found = BANNED_WORDS.filter(w => lower.includes(w.toLowerCase()))
  if (found.length >= 3) {
    throw new Error('Konten mengandung terlalu banyak kata tidak pantas. Mohon jaga kesopanan.')
  }
  return true
}
