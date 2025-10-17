import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import api from "../../../api";

import {
  LayoutGrid,
  LogOut,
  Map,
  MapPin,
  Building2,
  Landmark,
  FileText,
  Layers3,
  SquareGanttChart,
  Search,
  Menu,
  ChevronLeft,
  Users,
  TrendingUp,
  Database,
  Globe,
  ChevronRight,
  BarChart3,
  Zap,
  Shield,
} from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const asideRef = useRef(null);
  const mainRef = useRef(null);
  const touchStartYRef = useRef(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      api
        .get(`/search?q=${encodeURIComponent(searchQuery)}`)
        .then(({ data }) => {
          setSearchResults(data.results || []);
          setShowResults(true);
        })
        .catch(() => {
          setSearchResults([]);
          setShowResults(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen]);

  const handleSearchSelect = (result) => {
    setSearchQuery("");
    setShowResults(false);
    navigate(`/admin/${result.to}`);
  };

  function stopWheelChain(e, el) {
    const atTop = el.scrollTop <= 0;
    const atBottom =
      Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
      e.preventDefault(); // parent scroll আটকায়
    }
  }

  function onTouchStart(e) {
    touchStartYRef.current = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    const el = e.currentTarget;
    const currY = e.touches[0].clientY;
    const deltaY = touchStartYRef.current - currY;
    const atTop = el.scrollTop <= 0;
    const atBottom =
      Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
    if ((atTop && deltaY < 0) || (atBottom && deltaY > 0)) {
      e.preventDefault();
    }
  }

  // Ensure passive:false for wheel so preventDefault works everywhere
  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    const handler = (ev) => stopWheelChain(ev, el);
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 text-gray-900 flex flex-col">
      {/* Topbar - Glass morphism */}
      <header className="flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm px-6 h-16 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-all duration-200"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/admin"
            className="flex items-center gap-3 font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
              <LayoutGrid className="h-5 w-5" />
            </div>
            E-Land Admin
          </Link>
        </div>

        {/* Enhanced Search */}
        <div
          className={`hidden md:flex items-center transition-all duration-300 ${
            searchFocused ? "min-w-[400px]" : "min-w-[320px]"
          }`}
        >
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-6 text-black/100" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200/60 bg-white/50 backdrop-blur-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              placeholder="Search across registry..."
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200/60 backdrop-blur-sm max-h-64 overflow-y-auto z-50">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchSelect(result)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Search className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {result.name}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {result.type.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-700">
                {user?.name}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {user?.role === "admin"
                  ? "Administrator"
                  : user?.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : "User"}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Body grid */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
        {/* Enhanced Sidebar */}
        <aside
          ref={asideRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onMouseEnter={() => {
            if (mainRef.current) mainRef.current.style.overflowY = "hidden";
          }}
          onMouseLeave={() => {
            if (mainRef.current) mainRef.current.style.overflowY = "auto";
          }}
          className={`fixed md:sticky z-30 left-0 w-80 flex-none 
            top-16 bottom-0 md:bottom-auto 
            h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]
            bg-gradient-to-b from-white to-blue-50/30 backdrop-blur-xl
            border-r border-white/20 shadow-xl transform transition-transform duration-300 ease-in-out
            overflow-y-auto overscroll-none touch-pan-y ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }`}
        >
          <nav className="mt-3 p-5 space-y-1 text-sm ">
            <SideLink to="" end icon={<LayoutGrid className="h-4 w-4" />}>
              Dashboard Overview
            </SideLink>
            <SideLink to="revenue" icon={<TrendingUp className="h-4 w-4" />}>
              Revenue Details
            </SideLink>
            <SectionTitle icon={<Users className="h-4 w-4" />}>
              User Request{" "}
            </SectionTitle>
            <SideLink to="kyc-approvals" icon={<Shield className="h-4 w-4" />}>
              KYC Approvals
            </SideLink>
            <SideLink
              to="land-tax-registrations"
              icon={<FileText className="h-4 w-4" />}
            >
              LDT Register Approvals
            </SideLink>
            <SideLink to="mutations" icon={<FileText className="h-4 w-4" />}>
              Mutation Approvals
            </SideLink>
            <SectionTitle icon={<Globe className="h-4 w-4" />}>
              Geographic Data
            </SectionTitle>
            {user?.role === "admin" && (
              <>
                <SideLink to="divisions" icon={<Layers3 className="h-4 w-4" />}>
                  Divisions
                </SideLink>
                <SideLink
                  to="districts"
                  icon={<Building2 className="h-4 w-4" />}
                >
                  Districts
                </SideLink>
              </>
            )}
            <SideLink to="upazilas" icon={<Landmark className="h-4 w-4" />}>
              Upazilas / Thana
            </SideLink>
            <SideLink to="mouzas" icon={<MapPin className="h-4 w-4" />}>
              Mouzas
            </SideLink>
            <SideLink to="survey-types" icon={<Layers3 className="h-4 w-4" />}>
              Survey Types
            </SideLink>
            <SectionTitle icon={<BarChart3 className="h-4 w-4" />}>
              Land Records
            </SectionTitle>
            <SideLink to="zils" icon={<SquareGanttChart className="h-4 w-4" />}>
              Zils (Sheet)
            </SideLink>
            <SideLink to="mouza-maps" icon={<MapPin className="h-4 w-4" />}>
              Mouza Maps
            </SideLink>
            <SideLink to="draw-maps" icon={<Map className="h-4 w-4" />}>
              Draw Maps
            </SideLink>
            <SideLink to="dags" icon={<Map className="h-4 w-4" />}>
              Dags
            </SideLink>

            <SectionTitle icon={<FileText className="h-4 w-4" />}>
              Documents
            </SectionTitle>
            <SideLink to="khatian" icon={<FileText className="h-4 w-4" />}>
              Khatian Lookup
            </SideLink>
          </nav>
        </aside>

        {/* Right-side content */}
        <main
          ref={mainRef}
          className="flex-1 min-w-0 p-8 bg-black/4 overflow-y-auto overscroll-contain h-[calc(100vh-4rem)]"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

/** Enhanced Sidebar Components */
function SectionTitle({ children, icon }) {
  return (
    <div className="mt-6 mb-3 px-3 text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
      {icon}
      {children}
    </div>
  );
}

function SideLink({ to, icon, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 relative overflow-hidden",
          isActive
            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
            : "text-gray-700 hover:bg-white/80 hover:shadow-md border border-transparent hover:border-white/50",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`transition-transform duration-200 ${
              isActive
                ? "text-white"
                : "text-gray-400 group-hover:text-blue-500"
            }`}
          >
            {icon}
          </div>
          <span className="font-medium flex-1">{children}</span>
          <ChevronRight
            className={`h-4 w-4 transition-all duration-200 ${
              isActive
                ? "translate-x-0 opacity-100"
                : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
            }`}
          />
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5"></div>
          )}
        </>
      )}
    </NavLink>
  );
}

/**
 * Enhanced AdminHome with modern design
 */
export function AdminHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/dashboard")
      .then(({ data }) => {
        if (!mounted) return;
        setStats(data?.stats || {});
        setRevenue(data?.revenue || {});
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(
          e?.response?.data?.message || e.message || "Failed to load stats"
        );
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const kpiItems = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "Divisions",
        value: stats.divisions,
        icon: <Layers3 className="h-6 w-6" />,
        color: "from-blue-500 to-cyan-500",
        change: "+2.3%",
      },
      {
        label: "Districts",
        value: stats.districts,
        icon: <Building2 className="h-6 w-6" />,
        color: "from-purple-500 to-pink-500",
        change: "+1.8%",
      },
      {
        label: "Upazilas",
        value: stats.upazilas,
        icon: <Landmark className="h-6 w-6" />,
        color: "from-green-500 to-emerald-500",
        change: "+3.1%",
      },
      {
        label: "Mouzas",
        value: stats.mouzas,
        icon: <MapPin className="h-6 w-6" />,
        color: "from-orange-500 to-red-500",
        change: "+4.2%",
      },
      {
        label: "Sheets (Zil)",
        value: stats.zils,
        icon: <SquareGanttChart className="h-6 w-6" />,
        color: "from-indigo-500 to-blue-500",
        change: "+5.7%",
      },
      {
        label: "Dags",
        value: stats.dags,
        icon: <Map className="h-6 w-6" />,
        color: "from-teal-500 to-green-500",
        change: "+6.4%",
      },
    ].filter(Boolean);
  }, [stats]);

  const quickActions = [
    {
      title: "Manage Districts",
      description: "Update district information",
      icon: <Building2 className="h-6 w-6" />,
      to: "/admin/districts",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      title: "Khatian Search",
      description: "Quick record lookup",
      icon: <Search className="h-6 w-6" />,
      to: "/admin/khatian",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      title: "View Maps",
      description: "Geographic overview",
      icon: <Map className="h-6 w-6" />,
      to: "/admin/maps",
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    {
      title: "Reports",
      description: "Generate analytics",
      icon: <BarChart3 className="h-6 w-6" />,
      to: "/admin/reports",
      color: "bg-gradient-to-r from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-2xl shadow-lg">
              <Zap className="h-6 w-6 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Welcome back, {user?.name || "Admin"}!
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl">
            Here's your complete overview of the land registry system. Monitor
            activities, manage data, and track system performance.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/khatian"
            className="flex items-center gap-2 text-sm px-4 py-3 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Search className="h-4 w-4" />
            Quick Search
          </Link>
        </div>
      </div>

      {/* Error State */}
      {err && (
        <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-6 text-red-700 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold">Unable to load dashboard data</p>
              <p className="text-sm opacity-80">{err}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced KPI Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg animate-pulse border border-white/20"
              >
                <div className="h-6 w-20 bg-gray-200 rounded-xl mb-4" />
                <div className="h-8 w-12 bg-gray-200 rounded-xl mb-2" />
                <div className="h-4 w-16 bg-gray-200 rounded-xl" />
              </div>
            ))
          : kpiItems.map((kpi) => (
              <div
                key={kpi.label}
                className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-white/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${kpi.color} text-white`}
                  >
                    {kpi.icon}
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {kpi.change}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-2">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  {Number(kpi.value ?? 0).toLocaleString()}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`bg-gradient-to-r ${kpi.color} h-1 rounded-full transition-all duration-1000`}
                    style={{
                      width: `${Math.min(
                        100,
                        (Number(kpi.value) / 1000) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.to}
            className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-white/40 hover:-translate-y-1"
          >
            <div
              className={`p-3 rounded-xl ${action.color} text-white w-12 h-12 flex items-center justify-center mb-4`}
            >
              {action.icon}
            </div>
            <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-gray-900">
              {action.title}
            </h3>
            <p className="text-sm text-gray-600 group-hover:text-gray-700">
              {action.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Link
        to="/admin/revenue"
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer block"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Activity
          </h3>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white mb-3">
                <TrendingUp className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Daily Revenue
              </p>
              <p className="text-2xl font-bold text-gray-800">
                BDT {Number(revenue?.daily ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl text-white mb-3">
                <BarChart3 className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Monthly Revenue
              </p>
              <p className="text-2xl font-bold text-gray-800">
                BDT {Number(revenue?.monthly ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white mb-3">
                <TrendingUp className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Yearly Revenue
              </p>
              <p className="text-2xl font-bold text-gray-800">
                BDT {Number(revenue?.yearly ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}
