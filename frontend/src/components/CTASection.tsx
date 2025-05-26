// frontend/src/components/CTASection.tsx
'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center overflow-hidden shadow-2xl mx-4">
      {/* Background Pattern - Hidden on small screens for performance */}
      <div className="hidden sm:block absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}>
        </div>
      </div>

      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
          <span className="text-white font-semibold text-sm sm:text-base">🎁 Oferta Limitada</span>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4 sm:mb-6">
          Pronto para <span className="text-yellow-400">Acelerar</span> seu Crescimento Musical?
        </h2>
        
        {/* Description */}
        <p className="text-base sm:text-lg lg:text-xl text-indigo-100 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
          Junte-se a <strong>milhares de músicos</strong> que já transformaram sua percepção musical. 
          Primeira semana <span className="text-yellow-400 font-bold">100% gratuita</span> + 
          <span className="text-green-400 font-bold"> garantia de resultados</span>.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-6 sm:mb-8 px-4">
          <Link
            href="/auth/register"
            className="group relative inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-black text-indigo-900 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 sm:hover:scale-110 hover:-translate-y-1 sm:hover:-translate-y-2"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></span>
            <span className="relative flex items-center space-x-2 sm:space-x-3">
              <span>🚀</span>
              <span className="hidden sm:inline">Começar Agora - GRÁTIS</span>
              <span className="sm:hidden">Começar GRÁTIS</span>
              <span>⚡</span>
            </span>
          </Link>
          
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-bold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center space-x-2">
              <span className="hidden sm:inline">Já tenho conta</span>
              <span className="sm:hidden">Entrar</span>
              <span>→</span>
            </span>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto text-xs sm:text-sm px-4">
          <div className="flex items-center justify-center space-x-2 text-indigo-200">
            <span>✅</span>
            <span>Sem cartão de crédito</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-indigo-200">
            <span>✅</span>
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-indigo-200">
            <span>✅</span>
            <span>Suporte 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}