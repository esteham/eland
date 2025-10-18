import { useEffect, useState } from "react";
import api from "../../../api";
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Calendar,
  FileText,
  Receipt,
  Download,
} from "lucide-react";

export default function AdminRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedSection, setSelectedSection] = useState(null); // 'applications', 'land-tax-payments', or 'mutations'
  const [selectedDate, setSelectedDate] = useState("");
  const [detailsData, setDetailsData] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsErr, setDetailsErr] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/revenue-details")
      .then(({ data }) => {
        if (!mounted) return;
        setData(data);
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(
          e?.response?.data?.message || e.message || "Failed to load revenue details"
        );
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                <div className="h-6 w-20 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-8 w-12 bg-gray-200 rounded-xl mb-2"></div>
                <div className="h-4 w-16 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-6 text-red-700 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl">
            <Receipt className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="font-semibold">Unable to load revenue details</p>
            <p className="text-sm opacity-80">{err}</p>
          </div>
        </div>
      </div>
    );
  }

  const applications = data?.applications || {};
  const landTaxPayments = data?.land_tax_payments || {};
  const mutations = data?.mutations || {};

  const handleViewDetails = (section) => {
    setSelectedSection(section);
    setSelectedDate("");
    setDetailsData([]);
    setDetailsErr("");
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const fetchDetails = () => {
    if (!selectedDate) return;
    setDetailsLoading(true);
    setDetailsErr("");
    let endpoint;
    if (selectedSection === 'applications') {
      endpoint = `/admin/revenue/applications/${selectedDate}`;
    } else if (selectedSection === 'land-tax-payments') {
      endpoint = `/admin/revenue/land-tax-payments/${selectedDate}`;
    } else if (selectedSection === 'mutations') {
      endpoint = `/admin/revenue/mutations/${selectedDate}`;
    }
    api.get(endpoint)
      .then(({ data }) => {
        setDetailsData(data);
      })
      .catch((e) => {
        setDetailsErr(e?.response?.data?.message || e.message || "Failed to load details");
      })
      .finally(() => setDetailsLoading(false));
  };

  const downloadCSV = () => {
    if (!selectedDate) return;
    let endpoint;
    if (selectedSection === 'applications') {
      endpoint = `/admin/revenue/applications/${selectedDate}/csv`;
    } else if (selectedSection === 'land-tax-payments') {
      endpoint = `/admin/revenue/land-tax-payments/${selectedDate}/csv`;
    } else if (selectedSection === 'mutations') {
      endpoint = `/admin/revenue/mutations/${selectedDate}/csv`;
    }
    api.get(endpoint, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${selectedSection}_revenue_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((e) => {
        setDetailsErr(e?.response?.data?.message || e.message || "Failed to download CSV");
      });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-2xl shadow-lg">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Revenue Details
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl">
            Detailed breakdown of revenue sources including Applications and Land Tax Payments.
          </p>
        </div>
      </div>

      {/* Header Line */}
      <div className="flex gap-4">
        <button
          onClick={() => handleViewDetails('applications')}
          className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
            selectedSection === 'applications'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white/80 text-gray-800 hover:bg-white shadow-md'
          }`}
        >
          Applications Revenue
        </button>
        <button
          onClick={() => handleViewDetails('land-tax-payments')}
          className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
            selectedSection === 'land-tax-payments'
              ? 'bg-green-500 text-white shadow-lg'
              : 'bg-white/80 text-gray-800 hover:bg-white shadow-md'
          }`}
        >
          Land Tax Payments Revenue
        </button>
        <button
          onClick={() => handleViewDetails('mutations')}
          className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
            selectedSection === 'mutations'
              ? 'bg-purple-500 text-white shadow-lg'
              : 'bg-white/80 text-gray-800 hover:bg-white shadow-md'
          }`}
        >
          Mutations Revenue
        </button>
      </div>

      {/* Details Modal/Section */}
      {selectedSection && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedSection === 'applications' ? 'Applications Revenue Details' : selectedSection === 'land-tax-payments' ? 'Land Tax Payments Revenue Details' : 'Mutations Revenue Details'}
            </h3>
            <button
              onClick={() => setSelectedSection(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-4 mb-6">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchDetails}
              disabled={!selectedDate}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              View Revenue
            </button>
            <button
              onClick={downloadCSV}
              disabled={!selectedDate}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </button>
          </div>
          {detailsLoading && <p>Loading...</p>}
          {detailsErr && <p className="text-red-500">{detailsErr}</p>}
          {detailsData.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {detailsData.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{item.user.name}</span>
                  <span className="text-sm font-medium text-gray-800">
                    BDT {Number(item.fee_amount || item.amount).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">{item.payment_method}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.submitted_at || item.paid_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications Revenue */}
      {(!selectedSection || selectedSection === 'applications') && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Applications Revenue
            </h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl text-white mb-3">
                <Calendar className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Daily</p>
              <p className="text-2xl font-bold text-gray-800">
                BDT {Number(applications.daily ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white mb-3">
                <BarChart3 className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Monthly</p>
              <p className="text-2xl font-bold text-gray-800">
                BDT {Number(applications.monthly ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white mb-3">
                <TrendingUp className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Yearly</p>
              <p className="text-2xl font-bold text-gray-800">
                BDT {Number(applications.yearly ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
          {/* Recent Applications */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-700 mb-4">Recent Applications</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {applications.recent?.length > 0 ? (
                applications.recent.map((app) => (
                  <div key={app.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Application #{app.id}</span>
                    <span className="text-sm font-medium text-gray-800">
                      BDT {Number(app.fee_amount).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent applications</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Land Tax Payments Revenue */}
      {(!selectedSection || selectedSection === 'land-tax-payments') && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Receipt className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Land Tax Payments Revenue
            </h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white mb-3">
                <Calendar className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Daily</p>
              <p className="text-2xl font-bold text-gray-800">
                BDT {Number(landTaxPayments.daily ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl text-white mb-3">
                <BarChart3 className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Monthly</p>
              <p className="text-2xl font-bold text-gray-800">
                BDT {Number(landTaxPayments.monthly ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl text-white mb-3">
                <TrendingUp className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Yearly</p>
              <p className="text-2xl font-bold text-gray-800">
                BDT {Number(landTaxPayments.yearly ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
          {/* Recent Land Tax Payments */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-700 mb-4">Recent Land Tax Payments</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {landTaxPayments.recent?.length > 0 ? (
                landTaxPayments.recent.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Payment #{payment.id}</span>
                    <span className="text-sm font-medium text-gray-800">
                      BDT {Number(payment.amount).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(payment.paid_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent land tax payments</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mutations Revenue */}
      {(!selectedSection || selectedSection === 'mutations') && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Mutations Revenue
            </h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white mb-3">
                <Calendar className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Daily</p>
              <p className="text-2xl font-bold text-gray-800">
                BDT {Number(mutations.daily ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white mb-3">
                <BarChart3 className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Monthly</p>
              <p className="text-2xl font-bold text-gray-800">
                BDT {Number(mutations.monthly ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl text-white mb-3">
                <TrendingUp className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Yearly</p>
              <p className="text-2xl font-bold text-gray-800">
                BDT {Number(mutations.yearly ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
          {/* Recent Mutations */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-700 mb-4">Recent Mutations</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mutations.recent?.length > 0 ? (
                mutations.recent.map((mutation) => (
                  <div key={mutation.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Mutation #{mutation.id}</span>
                    <span className="text-sm font-medium text-gray-800">
                      BDT {Number(mutation.fee_amount).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(mutation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent mutations</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
