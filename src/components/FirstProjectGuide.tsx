import { Upload, Sparkles } from 'lucide-react';

interface FirstProjectGuideProps {
  onUpload: () => void;
  onViewExamples: () => void;
}

export default function FirstProjectGuide({ onUpload, onViewExamples }: FirstProjectGuideProps) {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center max-w-[600px] px-6">
        {/* Animated Illustration */}
        <div className="mb-6 flex justify-center">
          <div className="relative animate-breathing">
            {/* Upload Icon Container */}
            <div 
              className="w-60 h-60 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-16 h-16 rounded-2xl bg-blue-400" />
                <div className="absolute top-8 right-8 w-12 h-12 rounded-xl bg-purple-400" />
                <div className="absolute bottom-6 left-12 w-14 h-14 rounded-2xl bg-pink-400" />
                <div className="absolute bottom-8 right-6 w-10 h-10 rounded-lg bg-indigo-400" />
              </div>
              
              {/* Main Upload Icon */}
              <div className="relative z-10 w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                <Upload className="w-12 h-12 text-blue-500" />
              </div>
              
              {/* Sparkle Effects */}
              <Sparkles 
                className="absolute top-12 right-12 w-8 h-8 text-yellow-400 animate-pulse" 
                style={{ animationDelay: '0s' }}
              />
              <Sparkles 
                className="absolute bottom-16 left-16 w-6 h-6 text-purple-400 animate-pulse" 
                style={{ animationDelay: '0.5s' }}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 
          className="text-[#030213] mb-3"
          style={{ fontSize: '28px', fontWeight: 600 }}
        >
          Crie sua primeira transformação
        </h1>

        {/* Description */}
        <p 
          className="text-[#717182] max-w-[480px] mx-auto mb-8"
          style={{ fontSize: '16px', lineHeight: 1.6 }}
        >
          Faça upload de uma foto e veja a mágica acontecer em segundos
        </p>

        {/* Primary CTA */}
        <button
          onClick={onUpload}
          className="group relative w-[280px] h-14 bg-[#030213] text-white rounded-xl mx-auto flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-100"
          style={{ 
            fontSize: '16px', 
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(3, 2, 19, 0.2)'
          }}
        >
          <Upload className="w-5 h-5" />
          <span>Fazer upload de foto</span>
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 opacity-0 group-hover:opacity-20 transition-opacity" />
        </button>

        {/* Secondary CTA */}
        <button
          onClick={onViewExamples}
          className="mt-4 text-[#030213] hover:underline transition-all"
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          Ver exemplos antes
        </button>
      </div>
    </div>
  );
}
