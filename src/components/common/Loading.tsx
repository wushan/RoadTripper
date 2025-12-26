interface LoadingProps {
  message?: string;
}

export function Loading({ message = '\u8F09\u5165\u4E2D...' }: LoadingProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">{'\u{1F697}'}</span>
        </div>
      </div>

      <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}
