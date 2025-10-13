/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../../../api";

const MessagesTab = ({ t }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load notifications");
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(
        notifications.map((notif) =>
          notif.id === id
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(
        notifications.map((notif) => ({
          ...notif,
          read_at: notif.read_at || new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?"))
      return;
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((notif) => notif.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{t("messages")}</h2>
        {notifications.some((n) => !n.read_at) && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-600">{t("notificationsHere")}</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const isApproved =
              notification.type && notification.type.includes("approved");
            const isRejected =
              notification.type && notification.type.includes("rejected");
            return (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg ${
                  notification.read_at
                    ? "bg-gray-50 border-gray-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    <p
                      className={`text-gray-700 mt-1 ${
                        isApproved ? "text-green-700" : ""
                      } ${isRejected ? "text-red-700" : ""}`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {!notification.read_at && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessagesTab;
