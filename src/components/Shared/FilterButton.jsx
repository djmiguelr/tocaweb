import { motion } from 'framer-motion';

export function FilterButton({ active, onClick, icon, label }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300
        ${active 
          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
          : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
        }
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
} 