import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useMousePosition } from '../hooks/useMousePosition';

const DarkEye = ({ x, y, size, duration, mouseX, mouseY }) => {
  const eyeRef = useRef(null);
  const pupilAnimation = useAnimation();
  const eyeAnimation = useAnimation();

  useEffect(() => {
    if (!eyeRef.current) return;
    const eyeRect = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;
    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const angle = Math.atan2(deltaY, deltaX);
    const maxPupilMove = size * 0.2;
    const distance = Math.min(maxPupilMove, Math.hypot(deltaX, deltaY));
    const pupilX = Math.cos(angle) * distance;
    const pupilY = Math.sin(angle) * distance;

    pupilAnimation.start({
      x: pupilX,
      y: pupilY,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    });
  }, [mouseX, mouseY, size, pupilAnimation]);

  useEffect(() => {
    let mounted = true;

    eyeAnimation.start({
      opacity: 0.3,
      scale: 1,
      transition: { duration, ease: 'easeOut' },
    });

    const blink = async () => {
      if (!mounted) return;
      await new Promise((resolve) => setTimeout(resolve, 3000 + Math.random() * 7000));
      if (!mounted) return;
      await eyeAnimation.start({ scaleY: 0.1, transition: { duration: 0.075 } });
      if (!mounted) return;
      await eyeAnimation.start({ scaleY: 1, transition: { duration: 0.075, delay: 0.05 } });
      if (mounted) blink();
    };

    blink();

    return () => {
      mounted = false;
      eyeAnimation.stop();
    };
  }, [eyeAnimation, duration]);

  return (
    <motion.div
      ref={eyeRef}
      initial={{ opacity: 0, scale: 0.5, scaleY: 1 }}
      animate={eyeAnimation}
      exit={{ opacity: 0, scale: 0.2, transition: { duration } }}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        boxShadow: `0 0 ${size}px rgba(255, 0, 0, 0.7), inset 0 0 5px rgba(255, 255, 255, 0.1)`,
        zIndex: 5,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <motion.div
        style={{
          width: `${size * 0.4}px`,
          height: `${size * 0.4}px`,
          borderRadius: '50%',
          backgroundColor: 'black',
          boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
        }}
        animate={pupilAnimation}
      />
    </motion.div>
  );
};

export const DarkPresence = ({ isInactive }) => {
  const [eyes, setEyes] = useState([]);
  const mousePosition = useMousePosition();

  useEffect(() => {
    if (isInactive) {
      const newEyes = [];
      for (let i = 0; i < 15; i++) {
        newEyes.push({
          id: Math.random(),
          x: Math.floor(Math.random() * 90) + 5,
          y: Math.floor(Math.random() * 90) + 5,
          size: Math.random() * 20 + 25,
          duration: Math.random() * 1 + 1,
        });
      }
      setEyes(newEyes);
    } else {
      setEyes([]);
    }
  }, [isInactive]);

  return (
    <AnimatePresence>
      {eyes.map((eye) => (
        <DarkEye key={eye.id} {...eye} mouseX={mousePosition.x} mouseY={mousePosition.y} />
      ))}
    </AnimatePresence>
  );
};