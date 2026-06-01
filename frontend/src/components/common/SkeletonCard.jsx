export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-3.5 bg-gray-200 rounded-lg w-1/2" />
        <div className="flex justify-between pt-1">
          <div className="h-3.5 bg-gray-200 rounded-lg w-1/4" />
          <div className="h-3.5 bg-gray-200 rounded-lg w-1/3" />
        </div>
      </div>
    </div>
  )
}
