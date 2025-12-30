import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser } from '../api/api';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    email: '',
    dateOfBirth: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Tentative d\'inscription...', formData);

      // Appel API vers le backend
      const data = await signupUser({
        name: formData.name,
        alias: formData.alias,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      console.log("✅ Utilisateur créé :", data);
      setSuccess("Inscription réussie ! Redirection vers la page de connexion...");
      setLoading(false);
      
      // Redirection vers la page de connexion après inscription réussie (avec délai)
      setTimeout(() => {
        navigate('/signin');
      }, 3000);

    } catch (err) {
      console.error('❌ Erreur inscription:', err);
      setError(err.message || "Erreur lors de l'inscription");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-cover bg-center"
      style={{ backgroundImage: `url('/bright-ideas-bg.jpg')` }}>
      <div className="w-full max-w-6xl flex h-auto lg:h-[750px] bg-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-filter backdrop-blur-sm border border-white/20">

        {/* Partie gauche */}
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

        {/* Partie droite - Formulaire */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white overflow-y-auto">
          <div className="w-full max-w-md">
            <h2 className="font-serif text-4xl mb-3 text-gray-900">Create an Account</h2>
            <p className="text-gray-500 mb-6">Enter your personal details to get started</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom et Alias */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="text-sm font-semibold text-gray-600">Nom</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-2 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="alias" className="text-sm font-semibold text-gray-600">Alias</label>
                  <input
                    id="alias"
                    type="text"
                    placeholder="Enter a username"
                    required
                    value={formData.alias}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-2 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Email et Adresse */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="text-sm font-semibold text-gray-600">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-2 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="text-sm font-semibold text-gray-600">Adresse</label>
                  <input
                    id="address"
                    type="text"
                    placeholder="Enter your address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-2 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Date de naissance */}
              <div>
                <label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-600">Date de naissance</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={loading}
                  min="1965-01-01"
                  max="2010-12-31"
                  className="w-full p-2 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="text-sm font-semibold text-gray-600">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-2 pr-10 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-600">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-2 pr-10 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-gray-800 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 disabled:opacity-50"
                  >
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

              {/* Bouton Sign Up */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?
              <Link to="/signin" className="text-gray-800 hover:underline font-semibold ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;