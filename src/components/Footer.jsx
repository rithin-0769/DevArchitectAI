import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full py-8 mt-auto border-t border-slate-800 bg-slate-950 flex justify-center items-center">
      <div className="flex items-center space-x-2 text-slate-400 font-medium">
        <span>Developed by Rithin Ravoori</span>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
