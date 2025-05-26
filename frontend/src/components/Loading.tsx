// ===================================
// src/components/Loading.tsx
// ===================================
interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({ message = 'Carregando...', fullScreen = false }: LoadingProps) {
  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center' 
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-16 w-16'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}></div>
  );
}