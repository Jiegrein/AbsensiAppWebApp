import { ReactNode, useEffect, useRef } from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Centered dialog on wide screens, bottom sheet on phones. Closes on Escape and on the backdrop,
 * moves focus into the panel when it opens, and locks page scrolling behind it.
 */
export const Modal = ({ open, title, onClose, children }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal__panel" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={panelRef}>
        <header className="modal__head">
          <h2 id={titleId} className="modal__title">{title}</h2>
          <button type="button" className="icon-btn" aria-label="Tutup" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
};
