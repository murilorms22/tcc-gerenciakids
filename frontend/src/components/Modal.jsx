import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

/**
 * Componente Modal usando createPortal
 * Renderiza o conteúdo fora da árvore DOM principal
 */
export default function Modal({ isOpen, onClose, title, children }) {
  // Previne scroll do body quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup ao desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fecha modal ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay/Backdrop escuro */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Conteúdo do Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 animate-[fadeIn_0.2s_ease-out]">
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-(--border-gray)">
          <h2 id="modal-title" className="text-2xl font-bold text-(--azul-escuro)">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-(--text-gray) hover:text-(--azul-escuro) transition-colors p-2 rounded-lg hover:bg-(--bg-gray-light)"
            aria-label="Fechar modal"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        
        {/* Body do Modal */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  // Usa createPortal para renderizar fora da árvore DOM principal
  return createPortal(
    modalContent,
    document.getElementById('modal-root')
  );
}
