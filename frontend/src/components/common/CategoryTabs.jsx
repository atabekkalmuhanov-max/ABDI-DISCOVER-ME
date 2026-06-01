export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => {
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
              isActive
                ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'
            }`}
          >
            {cat.label}
            {cat.count !== null && (
              <span className={`text-xs ${isActive ? 'text-white/75' : 'text-gray-400'}`}>
                ({cat.count.toLocaleString('ru')})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
