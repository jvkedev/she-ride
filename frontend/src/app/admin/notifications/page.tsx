import PushNotificationForm from "@/components/admin/notifications/push-notification-form";
import PromoCodesPanel from "@/components/admin/notifications/promo-codes-panel";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function AdminNotificationsPage() {
  return (
    <DashboardPageLayout
      title="Notifications & promotions"
      
      wide
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <PushNotificationForm />
        <PromoCodesPanel />
      </div>
    </DashboardPageLayout>
  );
}
