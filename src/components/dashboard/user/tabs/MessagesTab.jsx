const MessagesTab = ({ t }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("messages")}
      </h2>
      <p className="text-gray-600">{t("notificationsHere")}</p>
    </div>
  );
};

export default MessagesTab;
