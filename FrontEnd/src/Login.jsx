import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock } from "lucide-react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function Login() {
  // state variables backing the login form inputs and feedback
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // initialize the particles engine when component mounts
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  // attempt to authenticate user by sending credentials to backend
  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch("http://localhost:8080/loginUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        credentials: "include",
      });

      const text = await response.text();
      setMessage(text);
    } catch (err) {
      setMessage("Server connection error");
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">

      {/* Particle animation used as a dynamic, interactive background */}
      <Particles
        init={particlesInit}
        className="absolute inset-0 -z-10"
        options={{
          background: { color: "#000" },
          particles: {
            number: { value: 70 },
            color: { value: "#58a6ff" },
            links: {
              enable: true,
              color: "#58a6ff",
              distance: 130,
              opacity: 0.3,
            },
            move: { enable: true, speed: 1 },
            size: { value: 2 },
          },
        }}
      />

      {/* Centered card containing the login form inputs and controls */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-[420px] bg-white/5 backdrop-blur-xl 
        border border-[rgba(88,166,255,0.3)] 
        rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] 
        p-8 text-white"
      >
        <h1 className="text-3xl font-semibold text-center mb-6 text-blue-400">
          Log In
        </h1>

        {/* email address input field with icon */}
        <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg mb-4 border border-white/10 focus-within:border-blue-400 transition">
          <User size={18} className="text-blue-400" />
          <input
            type="email"
            placeholder="User Email"
            className="bg-transparent outline-none w-full text-sm text-white placeholder-gray-400 autofill:bg-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* password input field with lock icon */}
        <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg mb-6 border border-white/10 focus-within:border-blue-400 transition">
          <Lock size={18} className="text-blue-400" />
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent outline-none w-full text-sm text-white placeholder-gray-400 autofill:bg-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* submit button that triggers authentication request */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium 
          bg-blue-500 hover:bg-blue-600 transition 
          shadow-lg shadow-blue-500/20"
        >
          {loading ? "Submitting..." : "Submit"}
        </motion.button>

        {/* display server response or error message when available */}
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-green-400"
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}