import { useEffect } from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const starsVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 0, transition: { duration: 0.8, delay: 0.2 } },
  exit: { opacity: 1, transition: { duration: 0.15 } },
};

function StarField() {
  const stars = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 0.4,
  }));

  return (
    <motion.div
      className="page-transition-stars"
      variants={starsVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {stars.map((star) => (
        <motion.div
          key={star.id}
          style={{
            position: 'absolute',
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            background: 'white',
            boxShadow: `0 0 ${star.size * 4}px rgba(149, 253, 252, 0.9), 0 0 ${star.size * 8}px rgba(254, 190, 253, 0.4)`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.5, 0.4, 0],
            scale: [0, 1.8, 1.2, 0],
            transition: { duration: 0.7, delay: star.delay, ease: 'easeOut' },
          }}
        />
      ))}
    </motion.div>
  );
}

export default function HomeTransition({ children }) {
  useEffect(() => {
    const circles = document.querySelectorAll('.circle-1, .circle-2');
    circles.forEach(c => {
      c.style.transition = 'opacity 0.3s ease';
      c.style.opacity = '0';
    });
    const timer = setTimeout(() => {
      circles.forEach(c => { c.style.opacity = ''; });
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <StarField />
      {children}
    </motion.div>
  );
}
