import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  Shield,
  LayoutDashboard,
  MapPinned,
} from "lucide-react";

import LogoHeader from "../../assets/images/LogoHeader.png";

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();

  // Close mobile on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const t = useMemo(
    () =>
      ({
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
          profile: "Profile",
        },
        bn: {
          home: "হোম",
          landRecords: "ভূমি রেকর্ড",
          landTax: "ভূমি কর",
          landMap: "দাগ অনুসন্ধান",
          dashboard: "ড্যাশবোর্ড",
          adminPanel: "অ্যাডমিন প্যানেল",
          login: "লগইন",
          register: "রেজিস্টার",
          logout: "লগআউট",
          welcome: "স্বাগতম",
          toggle: "English",
          profile: "প্রোফাইল",
        },
      }[language]),
    [language]
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top border glow */}
      <div className="h-[1px] w-full bg-gradient-to-r from-indigo-500/60 via-sky-400/60 to-fuchsia-500/60" />

      <div className="backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-3">
              <span
                className="h-10 w-40 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${LogoHeader})` }}
                aria-hidden
              />
              <span className="sr-only">E‑Land</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <NavItem
                to="/"
                label={t.home}
                active={location.pathname === "/"}
              />
              <NavItem
                to="/land"
                label={t.landRecords}
                active={location.pathname === "/land"}
              />
              <NavItem
                to="/land-tax"
                label={t.landTax}
                active={location.pathname === "/land-tax"}
              />
              <NavItem
                to="/dag-search-map"
                label={t.landMap}
                active={location.pathname === "/dag-search-map"}
                icon={<MapPinned className="h-4 w-4" />}
              />

              {user && (
                <NavItem
                  to="/dashboard"
                  label={t.dashboard}
                  active={location.pathname === "/dashboard"}
                  icon={<LayoutDashboard className="h-4 w-4" />}
                />
              )}
              {(user?.role === "admin" || user?.role === "acland") && (
                <NavItem
                  to="/admin"
                  label={t.adminPanel}
                  active={location.pathname.startsWith("/admin")}
                  icon={<Shield className="h-4 w-4" />}
                />
              )}
            </nav>

            {/* Right controls */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/70 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                aria-label="Toggle language"
              >
                <Globe className="h-4 w-4" /> {t.toggle}
              </button>

              {user ? (
                <div className="relative group">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
                    <Avatar name={user.name} />
                    <span className="max-w-[10rem] truncate text-left">
                      {user.name}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-80" />
                  </button>
                  {/* Dropdown */}
                  <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="p-2 text-sm">
                      <div className="px-3 py-2 text-slate-600">
                        <div className="font-medium">
                          {t.welcome}, {user.name.split(" ")[0]}
                        </div>
                        {user?.role && (
                          <span className="mt-1 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200">
                            {user.role}
                          </span>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
                        {t.profile}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left rounded-lg px-3 py-2 hover:bg-slate-50 text-red-600 font-semibold"
                      >
                        {t.logout}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    {t.login}
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    {t.register}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
            open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 pb-4">
            <div className="grid gap-2">
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-3 font-semibold text-slate-800"
              >
                <Globe className="h-4 w-4" /> {t.toggle}
              </button>

              <MobileItem
                to="/"
                label={t.home}
                active={location.pathname === "/"}
              />
              <MobileItem
                to="/land"
                label={t.landRecords}
                active={location.pathname === "/land"}
              />
              <MobileItem
                to="/land-tax"
                label={t.landTax}
                active={location.pathname === "/land-tax"}
              />
              <MobileItem
                to="/dag-search-map"
                label={t.landMap}
                active={location.pathname === "/dag-search-map"}
                icon={<MapPinned className="h-4 w-4" />}
              />

              {user && (
                <MobileItem
                  to="/dashboard"
                  label={t.dashboard}
                  active={location.pathname === "/dashboard"}
                  icon={<LayoutDashboard className="h-4 w-4" />}
                />
              )}
              {(user?.role === "admin" || user?.role === "acland") && (
                <MobileItem
                  to="/admin"
                  label={t.adminPanel}
                  active={location.pathname.startsWith("/admin")}
                  icon={<Shield className="h-4 w-4" />}
                />
              )}

              <div className="mt-3 border-t border-slate-200 pt-3">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Avatar name={user.name} />
                      <div className="leading-tight">
                        <div className="font-medium">{user.name}</div>
                        {user?.role && (
                          <div className="text-[11px] text-slate-500">
                            {user.role}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      {t.logout}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      className="rounded-lg bg-slate-100 px-4 py-3 text-center font-semibold text-slate-800"
                    >
                      {t.login}
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-lg bg-indigo-600 px-4 py-3 text-center font-semibold text-white"
                    >
                      {t.register}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, label, active, icon }) {
  return (
    <Link
      to={to}
      className={`relative inline-flex items-center gap-1 px-1.5 py-2 transition-colors ${
        active ? "text-indigo-700" : "text-slate-700 hover:text-indigo-700"
      }`}
    >
      {icon}
      <span>{label}</span>
      {/* Active underline */}
      <span
        className={`absolute left-0 -bottom-0.5 h-[2px] rounded-full bg-indigo-600 transition-all ${
          active ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
}

function MobileItem({ to, label, active, icon }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="grid h-6 w-6 place-items-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 border border-indigo-200">
      {initials}
    </div>
  );
}
