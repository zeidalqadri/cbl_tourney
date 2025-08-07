export function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg', text?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-16 h-16'
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-mss-turquoise to-cbl-orange rounded-full animate-spin`} />
        <div className={`absolute inset-2 bg-white dark:bg-gray-900 rounded-full`} />
      </div>
      {text && <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">{text}</p>}
    </div>
  )
}