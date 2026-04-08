import { useCallback, useRef, useEffect } from "react";
import { MASK_NAMES, MASK_IMAGES, MASK_DESCRIPTIONS, MASK_CHIBIS, CARD_VERSO } from "./mascaradeConstants.js";

export default function Card3DModal({ mask, onClose, showAcknowledge = false, label = null }) {
  const cardRef = useRef(null);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);
  const returnAnimId = useRef(null);
  const hasDragged = useRef(false);

  const applyTransform = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    const { x, y } = rotation.current;
    el.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
    const shinePos = Math.round(((((y % 360) + 360) % 360) / 360) * 100);
    el.style.setProperty("--shine-pos", `${shinePos}%`);
  }, []);

  const handleDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    hasDragged.current = false;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    if (returnAnimId.current) {
      cancelAnimationFrame(returnAnimId.current);
      returnAnimId.current = null;
    }
  }, []);

  const handleMove = useCallback((e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    rotation.current.y += dx * 0.4;
    rotation.current.x -= dy * 0.4;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasDragged.current = true;
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        applyTransform();
        rafId.current = null;
      });
    }
  }, [applyTransform]);

  const animateReturn = useCallback(() => {
    const lerp = 0.08;
    const snap = 0.3;
    const r = rotation.current;
    r.x += (0 - r.x) * lerp;
    r.y += (0 - r.y) * lerp;
    if (Math.abs(r.x) < snap && Math.abs(r.y) < snap) {
      r.x = 0;
      r.y = 0;
      applyTransform();
      returnAnimId.current = null;
      return;
    }
    applyTransform();
    returnAnimId.current = requestAnimationFrame(animateReturn);
  }, [applyTransform]);

  const handleUp = useCallback(() => {
    dragging.current = false;
    if (!returnAnimId.current) {
      returnAnimId.current = requestAnimationFrame(animateReturn);
    }
    // Reset hasDragged after a tick so the click event fires first
    setTimeout(() => { hasDragged.current = false; }, 0);
  }, [animateReturn]);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (returnAnimId.current) cancelAnimationFrame(returnAnimId.current);
    };
  }, []);

  const chibi = MASK_CHIBIS[mask];

  return (
    <div
      className="card-3d-overlay"
      onMouseMove={handleMove}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onClick={() => { if (!hasDragged.current && !showAcknowledge) onClose(); }}
    >
      <div className="card-3d-layout" onClick={(e) => e.stopPropagation()}>
        {/* Label au-dessus */}
        {label && <p className="card-3d-label">{label}</p>}
        <div className="card-3d-scene">
          <div className="card-3d" ref={cardRef} onMouseDown={handleDown}>
            <div className="card-3d-face card-3d-front">
              <img src={MASK_IMAGES[mask] || CARD_VERSO} alt={MASK_NAMES[mask] || mask} draggable={false} />
            </div>
            <div className="card-3d-face card-3d-back">
              <img src={CARD_VERSO} alt="Verso" draggable={false} />
            </div>
          </div>
        </div>

        {/* Infos sous la carte */}
        <div className="card-3d-info">
          <div className="card-3d-title-row">
            {chibi && <img className="card-3d-chibi" src={chibi} alt="" draggable={false} />}
            <span className="card-3d-name">{MASK_NAMES[mask] || mask}</span>
          </div>
          <span className="card-3d-desc">{MASK_DESCRIPTIONS[mask]}</span>
          <span className="card-3d-hint">Glisser pour tourner la carte</span>
        </div>

        {/* Bouton "Compris !" */}
        {showAcknowledge && (
          <button type="button" className="card-3d-acknowledge" onClick={onClose}>
            Compris !
          </button>
        )}
      </div>
    </div>
  );
}
