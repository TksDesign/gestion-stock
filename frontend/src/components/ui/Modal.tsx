import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

// Rendu via un portail dans document.body : un modal imbriqué dans une mise en page qui
// pose un z-index sur ses éléments (ex. ManagerLayout, sidebar en z-10) ne peut jamais
// dépasser visuellement ce parent quel que soit son propre z-index local — la pile
// d'empilement (stacking context) est hiérarchique. Le portail sort le modal de ce DOM
// pour le rendre directement sous <body>, où il compare son z-index au niveau racine.
export const Modal = ({ onClose, children, maxWidth = 'max-w-lg' }: ModalProps) => {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative bg-white dark:bg-[#111111] rounded-3xl p-8 w-full ${maxWidth} shadow-[0_24px_60px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar`}
      >
        {children}
      </motion.div>
    </div>,
    document.body
  );
};
