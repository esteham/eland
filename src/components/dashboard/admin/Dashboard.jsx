// src/components/dashboard/admin/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200/60 bg-white/50 backdrop-blur-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              placeholder="Search across registry..."
            />
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
      <div className="flex flex-1">
        {/* Enhanced Sidebar */}
        <aside
          className={`fixed md:static z-30 top-0 bottom-0 left-0 w-80 bg-gradient-to-b from-white to-blue-50/30 backdrop-blur-xl border-r border-white/20 shadow-xl transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            {/* <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-600">
                Navigation Panel
              </span>
            </div> */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-all duration-200"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <nav className="p-4 space-y-2 text-sm">
            <SideLink to="" end icon={<LayoutGrid className="h-4 w-4" />}>
              Dashboard Overview
            </SideLink>

            <SectionTitle icon={<Users className="h-4 w-4" />}>
              User Request            </SectionTitle>
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
<<<<<<< HEAD
            <SideLink to="mouza-maps" icon={<MapPin className="h-4 w-4" />}>
              Mouza Maps
            </SideLink>
            <SideLink to="draw-maps" icon={<Map className="h-4 w-4" />}>
              Draw Maps
            </SideLink>
=======
            <SideLink to="mouza-maps" icon={<Map className="h-4 w-4" />}>
              Mouza Maps
            </SideLink>
>>>>>>> c25ba98c99f021296fbefe8b2114c579a98d5bba
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
        <main className="flex-1 p-6 overflow-y-auto">
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
    <div className="mt-6 mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
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
        {/* <div className="flex gap-3">
          <Link
            to="/admin/khatian"
            className="flex items-center gap-2 text-sm px-4 py-3 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Search className="h-4 w-4" />
            Quick Search
          </Link>
          <Link
            to="/admin/districts"
            className="flex items-center gap-2 text-sm px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Database className="h-4 w-4" />
            Manage Data
          </Link>
        </div> */}
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

      {/* Recent Activity Placeholder */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Activity
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Activity analytics will appear here</p>
          <p className="text-sm">Recent updates and system usage metrics</p>
        </div>
      </div>
    </div>
  );
}
