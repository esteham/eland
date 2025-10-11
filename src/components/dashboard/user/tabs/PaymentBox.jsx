import { useState } from "react";
import api from "../../../../api";
import { LANGS } from "../../../../fonts/UserDashbboardFonts";

const PaymentBox = ({ mutationId, lang, onSuccess }) => {
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "bkash", // default
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await api.post(`/mutations/${mutationId}/pay`, paymentData);

      alert(
        lang === LANGS.BN
          ? "পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!"
          : "Payment completed successfully!"
      );
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error processing payment:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(lang === LANGS.BN ? "পেমেন্ট ব্যর্থ হয়েছে।" : "Payment failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">
        {lang === LANGS.BN ? "পেমেন্ট তথ্য" : "Payment Information"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {lang === LANGS.BN ? "পরিমাণ (টাকা)" : "Amount (BDT)"}
          </label>
          <input
            type="number"
            name="amount"
            value={paymentData.amount}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.amount && (
            <p className="text-red-500 text-sm">{errors.amount[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {lang === LANGS.BN ? "পেমেন্ট মেথড" : "Payment Method"}
          </label>
          <select
            name="method"
            value={paymentData.method}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="bkash">bKash</option>
            <option value="card">Card</option>
            <option value="bank">Bank Transfer</option>
          </select>
          {errors.method && (
            <p className="text-red-500 text-sm">{errors.method[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading
            ? lang === LANGS.BN
              ? "প্রক্রিয়া হচ্ছে..."
              : "Processing..."
            : lang === LANGS.BN
            ? "পেমেন্ট করুন"
            : "Pay Now"}
        </button>
      </form>
    </div>
  );
};

export default PaymentBox;
