import { motion } from "framer-motion";
import { User, Lock, Github } from "lucide-react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function App() {

  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">

      {/* 🔵 Particle Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0 -z-10"
        options={{
          background: { color: "#000000" },
          particles: {
            number: { value: 80 },
            color: { value: "#58a6ff" },
            links: {
              enable: true,
              color: "#58a6ff",
              distance: 150,
              opacity: 0.3
            },
            move: { enable: true, speed: 1 },
            size: { value: 2 }
          }
        }}
      />

      {/* 💎 Glass Terminal Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="
          w-[400px]
          bg-white/5
          backdrop-blur-xl
          border border-[rgba(88,166,255,0.3)]
          rounded-2xl
          shadow-[0_0_40px_rgba(0,0,0,0.5)]
          p-8
          text-white
        "
      >
        {/* Header */}
        <h1 className="text-2xl font-semibold mb-6 text-center text-blue-400">
          Terminal Portal
        </h1>

        {/* Username */}
        <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg mb-4">
          <User size={18} className="text-blue-400" />
          <input
            type="text"
            placeholder="Username"
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        {/* Password */}
        <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg mb-6">
          <Lock size={18} className="text-blue-400" />
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        {/* Login Button */}
        <button className="
          w-full
          py-3
          bg-blue-500
          hover:bg-blue-600
          transition
          rounded-lg
          font-medium
        ">
          Access System
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-xs text-white/50">OR</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Github Login */}
        <button className="
          w-full
          flex items-center justify-center gap-2
          py-3
          border border-white/20
          rounded-lg
          hover:bg-white/10
          transition
        ">
          <Github size={18} />
          Continue with GitHub
        </button>

      </motion.div>
    </div>
  );
}


