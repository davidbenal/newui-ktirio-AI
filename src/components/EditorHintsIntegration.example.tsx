/**
 * EXEMPLO DE INTEGRAÇÃO - Progressive Hints no Editor
 * 
 * Este arquivo mostra como integrar os Hints 1 e 2 no Editor.tsx
 * NÃO é um arquivo funcional, apenas documentação/exemplo
 */

import { useState, useEffect } from 'react';
import ProgressiveHint from './ProgressiveHint';
import { useProgressiveHints } from '../hooks/useProgressiveHints';

export default function EditorWithHints() {
  const { hasSeenHint, markHintAsSeen } = useProgressiveHints();
  
  // Track images generated
  const [imagesGenerated, setImagesGenerated] = useState(0);
  
  // Hint states
  const [showDownloadHint, setShowDownloadHint] = useState(false);
  const [showComparisonHint, setShowComparisonHint] = useState(false);

  // Hint 2: Show comparison hint after 2nd image
  useEffect(() => {
    if (imagesGenerated === 2 && !hasSeenHint('comparison-slider')) {
      setShowComparisonHint(true);
    }
  }, [imagesGenerated, hasSeenHint]);

  const handleGenerate = () => {
    // Generate image logic...
    
    // Increment counter
    setImagesGenerated(prev => prev + 1);
  };

  return (
    <div className="editor-container">
      {/* Result Image Container */}
      <div 
        className="result-section hint-download-button"
        onMouseEnter={() => {
          // Hint 1: Show download hint on first hover
          if (!hasSeenHint('download-image')) {
            setShowDownloadHint(true);
          }
        }}
      >
        <img src="result.jpg" alt="Result" />
        
        {/* Download button */}
        <button className="download-btn">
          Download
        </button>
      </div>

      {/* Comparison Toggle */}
      <div className="comparison-controls hint-comparison-toggle">
        <label>
          <input type="checkbox" />
          Comparar antes/depois
        </label>
      </div>

      {/* Generate Button */}
      <button onClick={handleGenerate}>
        Gerar Imagem
      </button>

      {/* Hint 1: Download */}
      <ProgressiveHint
        isVisible={showDownloadHint}
        onDismiss={() => {
          setShowDownloadHint(false);
          markHintAsSeen('download-image');
        }}
        text="Clique para baixar em alta resolução"
        position="bottom"
        targetSelector=".hint-download-button"
        delay={300}
        autoDismissDelay={8000}
      />

      {/* Hint 2: Comparison */}
      <ProgressiveHint
        isVisible={showComparisonHint}
        onDismiss={() => {
          setShowComparisonHint(false);
          markHintAsSeen('comparison-slider');
        }}
        text="Arraste para comparar antes e depois"
        position="top"
        targetSelector=".hint-comparison-toggle"
        showArrow={true}
        delay={1000}
        autoDismissDelay={10000}
      />
    </div>
  );
}

/**
 * PASSO A PASSO PARA INTEGRAR NO Editor.tsx REAL:
 * 
 * 1. Importar dependências:
 *    import ProgressiveHint from './ProgressiveHint';
 *    import { useProgressiveHints } from '../hooks/useProgressiveHints';
 * 
 * 2. Adicionar state:
 *    const { hasSeenHint, markHintAsSeen } = useProgressiveHints();
 *    const [imagesGenerated, setImagesGenerated] = useState(0);
 *    const [showDownloadHint, setShowDownloadHint] = useState(false);
 *    const [showComparisonHint, setShowComparisonHint] = useState(false);
 * 
 * 3. Adicionar classes nos elementos:
 *    <div className="... hint-download-button">
 *    <div className="... hint-comparison-toggle">
 * 
 * 4. Adicionar triggers:
 *    onMouseEnter={() => { if (!hasSeenHint('download-image')) setShowDownloadHint(true); }}
 *    useEffect(() => { if (imagesGenerated === 2) setShowComparisonHint(true); }, [imagesGenerated]);
 * 
 * 5. Renderizar hints:
 *    <ProgressiveHint isVisible={...} onDismiss={...} ... />
 * 
 * 6. Incrementar counter no handleGenerate:
 *    setImagesGenerated(prev => prev + 1);
 */
