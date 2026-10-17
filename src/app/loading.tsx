import { FeedSkeleton, FiltersSkeleton, FormSkeleton } from '@/components/skeletons'

// Мгновенный fallback для сегмента, пока сервер готовит страницу
export default function Loading() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="skeleton h-9 w-56" />
      <FormSkeleton />
      <FiltersSkeleton />
      <FeedSkeleton />
    </main>
  )
}
