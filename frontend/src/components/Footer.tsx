// frontend/src/components/Footer.tsx
'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12 mt-8 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Logo e Descrição */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <span className="text-white text-base sm:text-lg">🎵</span>
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold">Ear Training</div>
                <div className="text-xs sm:text-sm text-gray-400">Treinamento Musical</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Desenvolva sua percepção musical com exercícios interativos e cientificamente comprovados.
            </p>
          </div>

          {/* Exercícios */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Exercícios</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/exercises/intervals" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm">
                  <span>🎯</span>
                  <span>Identificação de Intervalos</span>
                </Link>
              </li>
              <li>
                <Link href="/exercises/progressions" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm">
                  <span>🎼</span>
                  <span>Progressões Harmônicas</span>
                </Link>
              </li>
              <li>
                <Link href="/exercises/melodic" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm">
                  <span>🎵</span>
                  <span>Ditado Melódico</span>
                </Link>
              </li>
              <li>
                <Link href="/exercises/rhythmic" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm">
                  <span>🥁</span>
                  <span>Ditado Rítmico</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Recursos</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/progress" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm">
                  <span>📈</span>
                  <span>Acompanhar Progresso</span>
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm">
                  <span>🏅</span>
                  <span>Sistema de Conquistas</span>
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm">
                  <span>🏆</span>
                  <span>Ranking Global</span>
                </Link>
              </li>
              <li>
                <Link href="/premium" className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center space-x-2 text-sm">
                  <span>✨</span>
                  <span>Recursos Premium</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Suporte</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm">
                  <span>❓</span>
                  <span>Central de Ajuda</span>
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm">
                  <span>📚</span>
                  <span>Tutoriais</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm">
                  <span>📧</span>
                  <span>Fale Conosco</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm">
                  <span>📝</span>
                  <span>Blog Musical</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-gray-400 text-sm text-center sm:text-left">
              © 2024 Ear Training. Todos os direitos reservados.
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacidade
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Termos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}