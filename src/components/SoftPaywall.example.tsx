import { useState } from 'react';
import SoftPaywall, { SoftPaywallVariant } from './SoftPaywall';
import { Download, Image as ImageIcon, Wand2 } from 'lucide-react';

/**
 * Exemplo completo de integração do Soft Paywall
 * Demonstra as 3 variações em cenários reais
 */

export default function SoftPaywallExample() {
  const [activeDemo, setActiveDemo] = useState<SoftPaywallVariant | null>(null);

  const mockImages = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=300&fit=crop',
  ];

  const handleUpgrade = () => {
    console.log('🚀 Upgrade clicked!');
    alert('Redirecionando para página de pricing...');
  };

  const handleViewPlans = () => {
    console.log('📋 View plans clicked');
    alert('Abrindo comparação de planos...');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h1 className="text-2xl text-gray-900 mb-2">Soft Paywall - Demonstração</h1>
          <p className="text-gray-600 mb-6">
            Preview limitado que incentiva upgrade sem bloquear completamente a experiência
          </p>

          {/* Demo Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveDemo('high-resolution')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                activeDemo === 'high-resolution'
                  ? 'border-[#030213] bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-gray-900 mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                Alta Resolução
              </h3>
              <p className="text-gray-600" style={{ fontSize: '13px' }}>
                Preview com blur + unlock card
              </p>
            </button>

            <button
              onClick={() => setActiveDemo('batch-processing')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                activeDemo === 'batch-processing'
                  ? 'border-[#030213] bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <ImageIcon className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-gray-900 mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                Batch Processing
              </h3>
              <p className="text-gray-600" style={{ fontSize: '13px' }}>
                Modal de processamento em lote
              </p>
            </button>

            <button
              onClick={() => setActiveDemo('watermark-removal')}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                activeDemo === 'watermark-removal'
                  ? 'border-[#030213] bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Wand2 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-gray-900 mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
                Watermark Removal
              </h3>
              <p className="text-gray-600" style={{ fontSize: '13px' }}>
                Hover overlay + modal de comparação
              </p>
            </button>
          </div>

          {activeDemo && (
            <button
              onClick={() => setActiveDemo(null)}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
            >
              ✕ Fechar demo
            </button>
          )}
        </div>

        {/* Demo Area */}
        {activeDemo === 'high-resolution' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl text-gray-900 mb-4">Variação 1: Alta Resolução com Blur</h2>
            <p className="text-gray-600 mb-6">
              Usuário vê o resultado, mas desfocado. Card central oferece unlock para 4K.
            </p>

            <SoftPaywall
              variant="high-resolution"
              onUpgrade={handleUpgrade}
              onViewPlans={handleViewPlans}
              previewImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=675&fit=crop"
              currentResolution="1024px"
              lockedResolution="4096px"
            />

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Caso de Uso</h4>
              <p className="text-sm text-blue-800">
                Usado no Editor após gerar uma imagem. Usuário free pode ver o resultado,
                mas ao tentar exportar em alta resolução, encontra este paywall suave.
              </p>
            </div>
          </div>
        )}

        {activeDemo === 'batch-processing' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl text-gray-900 mb-4">Variação 2: Batch Processing Preview</h2>
            <p className="text-gray-600 mb-6">
              Usuário seleciona múltiplas imagens. Modal mostra preview limitado e benefícios.
            </p>

            <div className="mb-6">
              <button
                onClick={() => {
                  // Trigger batch processing paywall
                }}
                className="px-6 py-3 bg-[#030213] text-white rounded-lg hover:bg-[#030213]/90 transition-colors"
              >
                Simular seleção de 10 imagens →
              </button>
            </div>

            <SoftPaywall
              variant="batch-processing"
              onUpgrade={handleUpgrade}
              selectedCount={10}
              previewImages={mockImages}
            />

            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="text-sm font-semibold text-purple-900 mb-2">💡 Caso de Uso</h4>
              <p className="text-sm text-purple-800">
                Na Gallery, usuário seleciona múltiplas imagens e clica em "Processar em lote".
                Este modal aparece mostrando preview das primeiras 3 e bloqueando o restante.
              </p>
            </div>
          </div>
        )}

        {activeDemo === 'watermark-removal' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl text-gray-900 mb-4">Variação 3: Watermark Removal Preview</h2>
            <p className="text-gray-600 mb-6">
              Imagem completa visível, mas com marca d'água. Hover mostra opção de upgrade.
            </p>

            <SoftPaywall
              variant="watermark-removal"
              onUpgrade={handleUpgrade}
              previewImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
            >
              {/* Child content - the actual image */}
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
                alt="Preview with watermark"
                className="w-full h-auto rounded-lg"
              />
            </SoftPaywall>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-semibold text-green-900 mb-2">💡 Caso de Uso</h4>
              <p className="text-sm text-green-800">
                Plano Free mostra resultados completos mas com marca d'água. Ao passar o mouse,
                aparece overlay suave convidando para upgrade. Click abre comparação lado a lado.
              </p>
            </div>
          </div>
        )}

        {/* Implementation Guide */}
        {!activeDemo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Integration Examples */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-4">Integração no Editor</h3>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-gray-800">{`// No botão de export
const handleExport = () => {
  if (userPlan === 'free') {
    setShowPaywall('high-resolution');
  } else {
    exportHighRes();
  }
};`}</pre>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-4">Integração na Gallery</h3>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-gray-800">{`// No botão de batch
const handleBatchProcess = () => {
  if (userPlan !== 'professional') {
    setShowPaywall('batch-processing');
  } else {
    processBatch();
  }
};`}</pre>
              </div>
            </div>

            {/* Features Comparison */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:col-span-2">
              <h3 className="text-lg text-gray-900 mb-4">Comparação de Variações</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Feature</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Alta Resolução</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Batch Processing</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Watermark</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Preview visível</td>
                      <td className="py-3 px-4">✓ Blur</td>
                      <td className="py-3 px-4">✓ Parcial</td>
                      <td className="py-3 px-4">✓ Completo</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Tipo de bloqueio</td>
                      <td className="py-3 px-4">Qualidade</td>
                      <td className="py-3 px-4">Quantidade</td>
                      <td className="py-3 px-4">Marca d'água</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Interatividade</td>
                      <td className="py-3 px-4">-</td>
                      <td className="py-3 px-4">-</td>
                      <td className="py-3 px-4">Hover + Click</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Melhor para</td>
                      <td className="py-3 px-4">Export features</td>
                      <td className="py-3 px-4">Bulk actions</td>
                      <td className="py-3 px-4">Todos os planos</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
