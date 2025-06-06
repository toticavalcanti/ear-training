// pages/debug.tsx (ou app/debug/page.tsx)
import AuthDebug from '@/components/AuthDebug';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <AuthDebug />
    </div>
  );
}