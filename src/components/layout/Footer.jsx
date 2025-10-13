import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative z-20 bg-gray-900 text-white py-3 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold">E-Land</span>
          </div>
          <div className="text-gray-400 text-center md:text-right">
            <p className="text-sm">
              © {new Date().getFullYear()} E-Land. All rights reserved.
            </p>
            <p className="text-xs mt-1">
              Comprehensive Land Record Management System
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
