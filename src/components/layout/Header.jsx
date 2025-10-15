import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";

import LogoHeader from "../../../public/images/LogoHeader.png";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();

  const translations = {
    en: {
      home: "Home",
      landRecords: "Land Records",
      landTax: "Land TAX",
      landMap: "Search Dag",
      dashboard: "Dashboard",
      adminPanel: "Admin Panel",
      login: "Login",
      register: "Register",
      logout: "Logout",
      welcome: "Welcome",
      toggle: "বাংলা",
    },
    bn: {
      home: "হোম",
      landRecords: "ভূমি রেকর্ড",
      landTax: "ভূমি কর",
      landMap: "Search Dag",
      dashboard: "ড্যাশবোর্ড",
      adminPanel: "অ্যাডমিন প্যানেল",
      login: "লগইন",
      register: "রেজিস্টার",
      logout: "লগআউট",
      welcome: "স্বাগতম",
      toggle: "English",
    },
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {/* <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">E-Land</span> */}
            <div
              className="fixed w-43 h-43 flex items-center justify-center"
              style={{
                backgroundImage: `url(${LogoHeader})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                backgroundPosition: "center",
                filter: "brightness(1)",
                pointerEvents: "none",
              }}
              aria-hidden="true"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition duration-300 ${
                location.pathname === "/"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {translations[language].home}
            </Link>
            <Link
              to="/land"
              className={`font-medium transition duration-300 ${
                location.pathname === "/land"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {translations[language].landRecords}
            </Link>

            <Link
              to="/land-tax"
              className={`font-medium transition duration-300 ${
                location.pathname === "/land-tax"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {translations[language].landTax}
            </Link>

            <Link
              to="/dag-search-map"
              className={`font-medium transition duration-300 ${
                location.pathname === "/dag-search-map"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {translations[language].landMap}
            </Link>
            {/* Show Dashboard for all logged-in users */}
            {user && (
              <Link
                to="/dashboard"
                className={`font-medium transition duration-300 ${
                  location.pathname === "/dashboard"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {translations[language].dashboard}
              </Link>
            )}

            {/* Show Admin Panel only for admin/acland */}
            {(user?.role === "admin" || user?.role === "acland") && (
              <Link
                to="/admin"
                className={`font-medium transition duration-300 ${
                  location.pathname.startsWith("/admin")
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {translations[language].adminPanel}
              </Link>
            )}
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              {translations[language].toggle}
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {translations[language].welcome}, {user.name}
                </span>

                {/* <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {user.role}
                </span> */}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                >
                  {translations[language].logout}
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition duration-300"
                >
                  {translations[language].login}
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition duration-300 shadow-lg hover:shadow-xl"
                >
                  {translations[language].register}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="flex flex-col space-y-1 px-4 py-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-300 text-center"
              >
                {translations[language].toggle}
              </button>

              {/* Mobile navigation links */}
              <Link
                to="/"
                className={`block py-3 px-4 rounded-lg font-medium transition duration-300 ${
                  location.pathname === "/"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {translations[language].home}
              </Link>
              <Link
                to="/land"
                className={`block py-3 px-4 rounded-lg font-medium transition duration-300 ${
                  location.pathname === "/land"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {translations[language].landRecords}
              </Link>

              <Link
                to="/land-tax"
                className={`block py-3 px-4 rounded-lg font-medium transition duration-300 ${
                  location.pathname === "/land-tax"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {translations[language].landTax}
              </Link>

              <Link
                to="/dag-search-map"
                className={`block py-3 px-4 rounded-lg font-medium transition duration-300 ${
                  location.pathname === "/dag-search-map"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {translations[language].landMap}
              </Link>

              {/* Show Dashboard for all logged-in users */}
              {user && (
                <Link
                  to="/dashboard"
                  className={`block py-3 px-4 rounded-lg font-medium transition duration-300 ${
                    location.pathname === "/dashboard"
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {translations[language].dashboard}
                </Link>
              )}

              {/* Show Admin Panel only for admin/acland */}
              {(user?.role === "admin" || user?.role === "acland") && (
                <Link
                  to="/admin"
                  className={`block py-3 px-4 rounded-lg font-medium transition duration-300 ${
                    location.pathname.startsWith("/admin")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {translations[language].adminPanel}
                </Link>
              )}

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 mt-4 pt-4">
                {user ? (
                  <div className="flex flex-col space-y-3">
                    <div className="px-4 py-2 text-gray-700">
                      {translations[language].welcome}, {user.name}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-40 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition duration-300 text-left"
                    >
                      {translations[language].logout}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link
                      to="/login"
                      className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition duration-300 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {translations[language].login}
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition duration-300 text-center shadow-lg hover:shadow-xl"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {translations[language].register}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
