import { motion } from 'framer-motion';

export function ViewButton({ active, onClick, icon }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
        ${active 
          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
          : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
        }
      `}
    >
      {icon}
    </motion.button>
  );
} 