import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translations } from "../../fonts/HomePageFonts";

import LogoPng from "../../../public/images/logo.png";

export default function HomePage() {
  const { language } = useLanguage();

  const t = useMemo(() => translations[language], [language]);

  return (
    <div className="min-h-screen bg-gradient-to-br py-12 from-blue-50 to-indigo-100 flex items-center justify-center relative">
      <div
        className="fixed top-20 right-0 h-[40vh] w-2/7 hidden md:block z-[1]"
        style={{
          backgroundImage: `url(${LogoPng})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundColor: "transparent",
          transition: "background-image 900ms ease-in-out",
          filter: "brightness(.98)",
          // pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      <div className="max-w-4xl mx-auto px-2 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-xl text-gray-500 mb-8">{t.subtitle}</p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
            {t.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/login"
            className="border-2 border-green-500 hover:bg-green-500 font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
          >
            {t.login}
          </Link>
          <Link
            to="/land"
            className="border-2 border-indigo-500 hover:bg-indigo-500 text-2xl font-semibold py-9 px-16 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
          >
            {t.explore}
          </Link>
          <Link
            to="/register"
            className="border-2 border-green-500 hover:bg-green-500 font-semibold py-3 px-10 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
          >
            {t.register}
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row gap-5 pt-3 justify-center items-center">
          {/* <Link
            to="/login"
            className="bg-blue-500 hover:bg-green-500  font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
          >
            Login to Your Account
          </Link> */}
          <Link
            to="/land-tax"
            className="border-2 border-purple-500 hover:bg-purple-500 text-xl font-semibold py-6 px-12 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
          >
            {t.ldt}
          </Link>
          {/* <Link
            to="/register"
            className="bg-indigo-500 hover:bg-green-500  font-semibold py-3 px-10 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
          >
            Create New Account
          </Link> */}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🏛️</div>
            <h3 className="text-xl font-semibold mb-2">{t.adminDivisions}</h3>
            <p className="text-gray-500">{t.adminDesc}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">{t.digitalRecords}</h3>
            <p className="text-gray-500">{t.digitalDesc}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">{t.secureAccess}</h3>
            <p className="text-gray-500">{t.secureDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
