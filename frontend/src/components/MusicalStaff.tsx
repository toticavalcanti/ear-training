// // src/components/MusicalStaff.tsx - VERSÃO CORRIGIDA
// 'use client';

// import React from 'react';
// import VexFlowMusicalStaff from './VexFlowMusicalStaff';

// interface HarmonicAnalysis {
//   degree: string;
//   symbol: string;
//   analysis: string;
//   voicing: number[];
// }

// interface MusicalStaffProps {
//   progression: {
//     degree: string;
//     symbol: string;
//     voicing: number[];
//   }[];
//   title?: string;
//   timeSignature?: string;
//   showChordSymbols?: boolean;
// }

// const MusicalStaff: React.FC<MusicalStaffProps> = ({
//   progression,
//   title,
//   timeSignature = "4/4",
//   showChordSymbols = true
// }) => {
//   // Converter para o formato esperado pelo VexFlowMusicalStaff
//   const harmonicAnalysis: HarmonicAnalysis[] = progression.map((chord) => ({
//     degree: chord.degree,
//     symbol: chord.symbol,
//     analysis: 'Análise harmônica',
//     voicing: chord.voicing
//   }));

//   return (
//     <div className="musical-staff-container">
//       {/* Renderizar com VexFlow */}
//       <VexFlowMusicalStaff
//         progression={harmonicAnalysis}
//         title={title}
//         timeSignature={timeSignature}
//         showChordSymbols={showChordSymbols}
//         showRomanNumerals={true}
//         width={800}
//         height={300}
//       />
      
//       {/* Instruções de uso */}
//       <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//         <div className="text-xs text-blue-800">
//           <p className="font-semibold mb-1">🎼 Pauta Musical Modernizada</p>
//           <p>
//             Esta pauta agora usa <strong>VexFlow</strong> para renderização profissional de notação musical.
//             Se você vir uma renderização simples, significa que o VexFlow ainda está carregando.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MusicalStaff;