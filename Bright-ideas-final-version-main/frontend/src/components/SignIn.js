import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur de connexion");
      }

      // Stocker les infos utilisateur dans localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🎯 Message de succès basé sur le rôle
      if (data.user.role === 'admin') {
        setSuccess("Connexion réussie ! Redirection vers le Dashboard Admin...");
        console.log("🔐 Redirection vers Admin Dashboard");
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        setSuccess("Connexion réussie ! Redirection vers la page d'accueil...");
        console.log("👤 Redirection vers Accueil");
        setTimeout(() => {
          navigate("/accueil");
        }, 3000);
      }

      setLoading(false);

    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(err.message || "Erreur de connexion. Vérifiez vos identifiants.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-cover bg-center">
      <div className="w-full max-w-6xl flex h-[650px] bg-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-filter backdrop-blur-sm border border-white/20">
        {/* Left Panel */}
        <div className="relative hidden lg:flex w-1/2 items-end p-12 text-white">
          <div className="relative z-10 w-full max-w-md p-8 rounded-3xl backdrop-blur-sm bg-black/40 border border-white/20">
            <p className="text-sm uppercase tracking-widest text-gray-300 mb-8">BRIGHT IDEAS</p>
            <h1 className="font-serif text-5xl text-white leading-tight">
              Where ideas<br />meet innovation.
            </h1>
            <p className="text-gray-200 text-lg mt-6">
              Share your creativity, connect with innovators, and bring your bright ideas to life.
            </p>
          </div>
        </div>

        {/* Right Panel - Sign In Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white">
          <div className="w-full max-w-md">
            <div className="text-right mb-12">
              <span className="font-semibold text-lg text-gray-700">logo</span>
            </div>

            <h2 className="font-serif text-4xl mb-3 text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mb-8">Enter your email and password to access your account</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="text-sm font-semibold text-gray-600">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full p-2 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 transition-colors"
                  onChange={handleChange}
                  value={formData.email}
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-semibold text-gray-600">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className="w-full p-2 pr-10 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 transition-colors"
                    onChange={handleChange}
                    value={formData.password}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center font-semibold text-sm">
                  {error}
                </div>
              )}

              {/* Message de succès */}
              {success && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center font-semibold text-sm">
                  {success}
                </div>
              )}

              <button type="submit" className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors mt-8 disabled:opacity-70" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
              Don't have an account?
              <Link to="/signup" className="text-gray-800 hover:underline font-semibold ml-1">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;