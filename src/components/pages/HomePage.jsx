/* eslint-disable no-unused-vars */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPinned,
  Database,
  ShieldCheck,
  FileSearch,
  Building2,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Users,
  BarChart3,
  Globe,
} from "lucide-react";

import { useLanguage } from "../../contexts/LanguageContext";
import { translations } from "../../fonts/HomePageFonts";

import Background from "../../../public/images/background.png";
import LogoPng from "../../../public/images/Logo.png";

export default function HomePage() {
  const { language } = useLanguage();
  const t = useMemo(
    () => translations[language] ?? translations.en,
    [language]
  );

  /** Enhanced animation presets */
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.1 } },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900 relative overflow-hidden">
      {/* Enhanced background design */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-100/20 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-blue-100/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-emerald-100/10 blur-3xl" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(100,116,139,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Floating logo watermark - more subtle */}
      <div
        aria-hidden
        className="fixed  h-[100vh] w-[150vw]  hidden xl:block opacity-[0.65]"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Floating logo watermark - more subtle */}
      <div
        aria-hidden
        className="fixed  h-[35vh] w-[35vw] max-w-[480px] hidden xl:block opacity-[1]"
        style={{
          backgroundImage: `url(${LogoPng})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      />

      {/* HERO SECTION */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-14">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-white/20"
              variants={fadeUp}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <ShieldCheck className="h-4 w-4 text-emerald-600" />{" "}
                {t?.badge ?? "Secure Digital Land Governance"}
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent"
            >
              {t.title}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-l sm:text-xl  font-semibold leading-relaxed max-w-3xl mx-auto"
            >
              {t.subtitle}
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-lg  leading-8 max-w-2xl mx-auto"
            >
              {t.description}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/land"
                className="group inline-flex items-center justify-center rounded-2xl bg-slate-900 px-8 py-4 text-white font-semibold shadow-lg hover:bg-slate-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                <MapPinned className="mr-3 h-5 w-5" />
                {t.explore}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/land-tax"
                className="group inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/80 backdrop-blur-sm px-8 py-4 font-semibold text-slate-700 hover:bg-white hover:border-slate-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <FileSpreadsheet className="mr-3 h-5 w-5" />
                {t.ldt}
              </Link>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              variants={fadeUp}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              <StatCard number="64" label={t?.statDistricts ?? "Districts"} />
              <StatCard number="495+" label={t?.statUpazilas ?? "Upazilas"} />
              <StatCard number="12k+" label={t?.statMouzas ?? "Mouzas"} />
              <StatCard number="Millions" label={t?.statRecords ?? "Records"} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="relative border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-8">
              {t.trustText}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
              <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
              <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
              <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="relative bg-slate-900/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              {t.featureTitle}
            </h2>
            <p className="mt-4 text-lg text-slate-600">{t.featureDesc}</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <EnhancedFeatureCard
              icon={<Building2 className="h-6 w-6" />}
              title={t.adminDivisions}
              desc={t.adminDesc}
              features={t.adminFeatures}
            />
            <EnhancedFeatureCard
              icon={<Database className="h-6 w-6" />}
              title={t.digitalRecords}
              desc={t.digitalDesc}
              features={t.digitalFeatures}
            />
            <EnhancedFeatureCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title={t.secureAccess}
              desc={t.secureDesc}
              features={t.secureFeatures}
            />
            <EnhancedFeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title={t.analyticsTitle}
              desc={t.analyticsDesc}
              features={t.analyticsFeatures}
            />
            <EnhancedFeatureCard
              icon={<Users className="h-6 w-6" />}
              title={t.multiUserTitle}
              desc={t.multiUserDesc}
              features={t.multiUserFeatures}
            />
            <EnhancedFeatureCard
              icon={<Globe className="h-6 w-6" />}
              title={t.publicAccessTitle}
              desc={t.publicAccessDesc}
              features={t.publicAccessFeatures}
            />
          </motion.div>
        </div>
      </section>

      {/* HIGHLIGHT SECTION */}
      <section className="relative bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 mb-6">
                <FileSearch className="h-4 w-4" />
                Advanced Search Capabilities
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {t?.calloutTitle ?? "Search Dag & Khatian in Seconds"}
              </h2>

              <p className="mt-4 text-lg text-slate-600 leading-8">
                {t?.calloutDesc ??
                  "Lightning‑fast queries across divisions, districts, upazilas, and mouzas—complete with map overlays and PDF exports."}
              </p>

              <div className="mt-8 space-y-4">
                <FeatureItem text="Instant search across millions of records" />
                <FeatureItem text="Interactive map integration with Leaflet" />
                <FeatureItem text="Role-based access control system" />
                <FeatureItem text="Real-time data synchronization" />
                <FeatureItem text="Mobile-responsive design" />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <EnhancedPill>
                  <FileSearch className="h-4 w-4 mr-2" />
                  {t?.pillSearch ?? "Advanced Search"}
                </EnhancedPill>
                <EnhancedPill>
                  <MapPinned className="h-4 w-4 mr-2" />
                  {t?.pillMap ?? "Leaflet Map Layers"}
                </EnhancedPill>
                <EnhancedPill>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {t?.pillAuth ?? "Role‑based Access"}
                </EnhancedPill>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-blue-500/5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent" />

                {/* Mock browser window */}
                <div className="relative mb-4 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center text-sm font-medium text-slate-500">
                    eland.xetroot.com
                  </div>
                </div>

                <div className="relative aspect-[16/10] w-full rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/60 overflow-hidden">
                  {/* Mock map interface */}
                  <div className="absolute inset-0 grid grid-cols-4 gap-4 p-4">
                    <div className="col-span-1 space-y-3">
                      <div className="bg-slate-200 rounded text-sm">
                        Search Dag
                      </div>
                      <div className="bg-slate-200 rounded text-sm">
                        Find Location
                      </div>
                      <div className="bg-blue-200 rounded text-sm">Pay LDT</div>
                      <div className="bg-slate-200 rounded text-sm">
                        Mutaion
                      </div>
                    </div>
                    <div className="col-span-3 bg-white rounded-lg border border-slate-200 relative">
                      <MapContainer
                        center={[23.8041, 90.4152]}
                        zoom={7}
                        className="h-full w-full rounded-xl"
                        zoomControl={false}
                        attributionControl={false}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution="© OpenStreetMap contributors"
                        />
                      </MapContainer>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-7 left-2/11 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPinned className="h-4 w-4" />
                  <span className="text-sm font-medium">Interactive Map</span>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -bottom-6 -left-6 h-24 w-24 bg-blue-500/10 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -right-6 h-20 w-20 bg-green-500/10 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative bg-gradient-to-r from-slate-900 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 to-transparent"></div>
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h3
              className="text-3xl sm:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t?.ctaTitle ?? "Ready to digitize land records?"}
            </motion.h3>

            <motion.p
              className="text-lg text-blue-100/90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {t?.ctaDesc ??
                "Start exploring or sign in to manage taxes, mutations, and administrative datasets."}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/register"
                className="group inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 font-semibold text-slate-900 hover:bg-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/login"
                className="group inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-8 py-4 font-semibold text-white hover:bg-white/20 transition-all duration-300 hover:shadow-lg"
              >
                {t.login}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.p
              className="mt-6 text-sm text-blue-200/70"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              No credit card required • Free 30-day trial • Setup in minutes
            </motion.p>
          </div>
        </div>
      </section>
    </div>
  );
}

function EnhancedFeatureCard({ icon, title, desc, features = [] }) {
  return (
    <motion.div
      className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="flex items-center gap-4 mb-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        </div>

        <p className="text-slate-600 leading-7 mb-6">{desc}</p>

        {features.length > 0 && (
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center gap-3 text-sm text-slate-600"
              >
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ number, label }) {
  return (
    <motion.div
      className="text-center p-4"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="text-2xl sm:text-3xl font-bold text-slate-900 bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
        {number}
      </div>
      <div className="text-sm text-slate-600 mt-2 font-medium">{label}</div>
    </motion.div>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
      <span className="text-slate-700">{text}</span>
    </div>
  );
}

function EnhancedPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors duration-200">
      {children}
    </span>
  );
}
