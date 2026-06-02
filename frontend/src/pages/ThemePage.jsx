import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Clock, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const PRICE_LABELS = { 1: 'от 150 000 сум', 2: 'от 300 000 сум', 3: 'от 600 000 сум' }

const THEMES = {
  timurid: {
    title: 'Архитектура Тимуридов',
    subtitle: 'Величественные памятники эпохи Тимуридов — шедевры средневекового зодчества',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Registan_01.jpg',
    tours: [
      { id: 1, name: 'Регистан: три медресе', location: 'Самарканд', duration: '3 часа', rating: 4.9, reviews: 312, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Registan_01.jpg' },
      { id: 2, name: 'Гур-Эмир — усыпальница Тамерлана', location: 'Самарканд', duration: '2 часа', rating: 4.8, reviews: 228, price: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Gur-Emir_mausoleum%2C_Samarkand%2C_Uzbekistan.jpg/800px-Gur-Emir_mausoleum%2C_Samarkand%2C_Uzbekistan.jpg' },
      { id: 3, name: 'Мечеть Биби-Ханым', location: 'Самарканд', duration: '1.5 часа', rating: 4.7, reviews: 184, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Bibi-Khanym_mosque.jpg/800px-Bibi-Khanym_mosque.jpg' },
      { id: 4, name: 'Медресе Улугбека в Бухаре', location: 'Бухара', duration: '2 часа', rating: 4.8, reviews: 143, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bukhara-ulugbekm.jpg/800px-Bukhara-ulugbekm.jpg' },
      { id: 5, name: 'Дворец Ак-Сарай в Шахрисабзе', location: 'Шахрисабз', duration: '3 часа', rating: 4.6, reviews: 97, price: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Shakhrisabz_Ak_Saray.jpg/800px-Shakhrisabz_Ak_Saray.jpg' },
      { id: 6, name: 'Обсерватория Улугбека', location: 'Самарканд', duration: '1 час', rating: 4.5, reviews: 79, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Samarkand_Ulug-Beg_Observatory.jpg/800px-Samarkand_Ulug-Beg_Observatory.jpg' },
    ],
  },
  'silk-road': {
    title: 'Великий Шёлковый путь',
    subtitle: 'Пройдите по следам древних торговых караванов от Китая до Средиземноморья',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Bukhara_Caravansaray.jpg',
    tours: [
      { id: 1, name: 'Торговые купола Бухары', location: 'Бухара', duration: '2.5 часа', rating: 4.8, reviews: 196, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Toki-Zargaron_trading_dome_in_Bukhara.jpg/800px-Toki-Zargaron_trading_dome_in_Bukhara.jpg' },
      { id: 2, name: 'Мавзолей Исмаила Самани', location: 'Бухара', duration: '1.5 часа', rating: 4.9, reviews: 241, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Ismail_samani_mausoleum.jpg/800px-Ismail_samani_mausoleum.jpg' },
      { id: 3, name: 'Пайканд — "купеческий город"', location: 'Бухарская обл.', duration: '4 часа', rating: 4.5, reviews: 62, price: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Bukhara-old-city.jpg/800px-Bukhara-old-city.jpg' },
      { id: 4, name: 'Каравансарай Рабат-и-Малик', location: 'Навои', duration: '3 часа', rating: 4.7, reviews: 88, price: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Rabat-i_Malik_caravanserai.jpg/800px-Rabat-i_Malik_caravanserai.jpg' },
      { id: 5, name: 'Базар Чорсу — сердце Ташкента', location: 'Ташкент', duration: '2 часа', rating: 4.6, reviews: 317, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Chorsu_bazaar_in_Tashkent.jpg/800px-Chorsu_bazaar_in_Tashkent.jpg' },
    ],
  },
  mosques: {
    title: 'Мечети и медресе',
    subtitle: 'Духовные центры исламской культуры — от монументальных соборных мечетей до камерных медресе',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Itchan_Kala_minaret.jpg',
    tours: [
      { id: 1, name: 'Мечеть Калян и минарет', location: 'Бухара', duration: '2 часа', rating: 4.9, reviews: 278, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Bukhara_Kalyan_mosque.jpg/800px-Bukhara_Kalyan_mosque.jpg' },
      { id: 2, name: 'Медресе Мири Арабская', location: 'Бухара', duration: '1.5 часа', rating: 4.8, reviews: 203, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Mir-i-Arab_madrasa_in_Bukhara.jpg/800px-Mir-i-Arab_madrasa_in_Bukhara.jpg' },
      { id: 3, name: 'Джума мечеть в Хиве', location: 'Хива', duration: '1.5 часа', rating: 4.7, reviews: 154, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Juma_mosque_in_Khiva.jpg/800px-Juma_mosque_in_Khiva.jpg' },
      { id: 4, name: 'Медресе Абдулазиз-хана', location: 'Бухара', duration: '1 час', rating: 4.6, reviews: 119, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Abdulaziz_Khan_madrasah.jpg/800px-Abdulaziz_Khan_madrasah.jpg' },
      { id: 5, name: 'Ханака Надира Диван-Беги', location: 'Бухара', duration: '1 час', rating: 4.7, reviews: 98, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Nadir_Divan-Begi_khanaka_in_Bukhara.jpg/800px-Nadir_Divan-Begi_khanaka_in_Bukhara.jpg' },
      { id: 6, name: 'Медресе Кукельдаш в Ташкенте', location: 'Ташкент', duration: '1 час', rating: 4.5, reviews: 87, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Kukeldash_madrasah_tashkent.jpg/800px-Kukeldash_madrasah_tashkent.jpg' },
    ],
  },
  'shah-i-zinda': {
    title: 'Мавзолеи Шах-и-Зинда',
    subtitle: 'Некрополь "Живой царь" — улица мавзолеев с бирюзовыми куполами XI–XV веков',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Shahi-Zinda_271.jpg',
    tours: [
      { id: 1, name: 'Ансамбль Шах-и-Зинда целиком', location: 'Самарканд', duration: '2.5 часа', rating: 4.9, reviews: 354, price: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Shahi-Zinda_271.jpg' },
      { id: 2, name: 'Мавзолей Кусама ибн Аббаса', location: 'Самарканд', duration: '1.5 часа', rating: 4.8, reviews: 187, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Shah-i-Zinda_Samarkand.jpg/800px-Shah-i-Zinda_Samarkand.jpg' },
      { id: 3, name: 'Мавзолей Туман-ака', location: 'Самарканд', duration: '1 час', rating: 4.7, reviews: 132, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Shahi_Zinda_Samarkand_2.jpg/800px-Shahi_Zinda_Samarkand_2.jpg' },
      { id: 4, name: 'Чашма-Аюб — источник Иова', location: 'Бухара', duration: '1 час', rating: 4.6, reviews: 94, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Chashma-Ayub.jpg/800px-Chashma-Ayub.jpg' },
      { id: 5, name: 'Ансамбль Дорут-Тиловат', location: 'Шахрисабз', duration: '2 часа', rating: 4.7, reviews: 73, price: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Shakhrisabz_Dorut_Tilyavat.jpg/800px-Shakhrisabz_Dorut_Tilyavat.jpg' },
    ],
  },
  mountains: {
    title: 'Горные маршруты',
    subtitle: 'Тянь-Шань, Памиро-Алай и Нуратау — незабываемые треккинг-маршруты среди первозданной природы',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Tian_Shan_Panorama.jpg',
    tours: [
      { id: 1, name: 'Треккинг в горах Нуратау', location: 'Нуратинский хребет', duration: '1 день', rating: 4.8, reviews: 112, price: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Tian_Shan_Panorama.jpg/800px-Tian_Shan_Panorama.jpg' },
      { id: 2, name: 'Озеро Айдаркуль — жемчужина пустыни', location: 'Навои', duration: '2 дня', rating: 4.7, reviews: 89, price: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Aydar_Lake_Uzbekistan.jpg/800px-Aydar_Lake_Uzbekistan.jpg' },
      { id: 3, name: 'Горные водопады Чимгана', location: 'Чимган', duration: '1 день', rating: 4.9, reviews: 201, price: 2, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Chimgan_mountains.jpg/800px-Chimgan_mountains.jpg' },
      { id: 4, name: 'Перевал Камчик — дорога в небо', location: 'Ферганская долина', duration: '4 часа', rating: 4.6, reviews: 74, price: 1, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Kamchik_pass.jpg/800px-Kamchik_pass.jpg' },
      { id: 5, name: 'Пик Хазрат Султан (4643 м)', location: 'Зарафшанский хребет', duration: '3 дня', rating: 4.8, reviews: 43, price: 3, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Hazrat_Sultan_Peak.jpg/800px-Hazrat_Sultan_Peak.jpg' },
    ],
  },
}

function TourCard({ tour }) {
  const handleClick = () => {
    toast('Подробная страница тура скоро будет доступна', { icon: '🗺️' })
  }

  return (
    <div
      onClick={handleClick}
      className="group bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={tour.image}
          alt={tour.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = `https://placehold.co/600x400/1DB8A8/white?text=${encodeURIComponent(tour.name)}`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-900">{tour.rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-[15px] leading-snug mb-2 group-hover:text-primary-600 transition-colors">
          {tour.name}
        </h3>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {tour.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {tour.duration}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-slate-500">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 inline mr-0.5" />
            {tour.rating.toFixed(1)} ({tour.reviews} отзывов)
          </span>
          <span className="text-xs font-semibold text-primary-600">{PRICE_LABELS[tour.price]}</span>
        </div>
      </div>
    </div>
  )
}

export default function ThemePage() {
  const { slug } = useParams()
  const theme = THEMES[slug]

  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">Тема не найдена</p>
          <Link to="/" className="mt-4 inline-block text-primary-600 hover:underline">На главную</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-dark-900 pb-16">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={theme.image}
          alt={theme.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://placehold.co/1400x400/1DB8A8/white?text=${encodeURIComponent(theme.title)}`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-1">{theme.title}</h1>
          <p className="text-white/80 text-sm max-w-xl">{theme.subtitle}</p>
        </div>
      </div>

      {/* Tours grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          {theme.tours.length} маршрутов по теме
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {theme.tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </div>
  )
}
