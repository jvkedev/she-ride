import type {
  AdminActivity,
  AdminDriver,
  AdminRide,
  AdminRider,
  AdminSosAlert,
  AdminTicket,
  AdminTransaction,
} from "@/lib/admin/types";

export const adminOverviewStats = {
  revenue: 2847500,
  revenueChange: "+12.4%",
  activeRides: 142,
  onlineDrivers: 318,
  pendingApprovals: 24,
  totalRiders: 12480,
};

export const revenueChartData = [
  { day: "Mon", revenue: 320000, rides: 420 },
  { day: "Tue", revenue: 380000, rides: 480 },
  { day: "Wed", revenue: 350000, rides: 445 },
  { day: "Thu", revenue: 410000, rides: 510 },
  { day: "Fri", revenue: 465000, rides: 580 },
  { day: "Sat", revenue: 520000, rides: 640 },
  { day: "Sun", revenue: 402500, rides: 495 },
];

export const recentActivity: AdminActivity[] = [
  { id: "a1", message: "New driver KYC submitted — Priya Sharma", time: "2 min ago", type: "driver" },
  { id: "a2", message: "Ride #RD-8821 completed — ₹156", time: "5 min ago", type: "ride" },
  { id: "a3", message: "SOS alert triggered on ride #RD-8819", time: "8 min ago", type: "safety" },
  { id: "a4", message: "Payout ₹12,500 processed to captain", time: "15 min ago", type: "payment" },
  { id: "a5", message: "Rider Ananya Kapoor blocked by admin", time: "22 min ago", type: "ride" },
];

export const adminDrivers: AdminDriver[] = [
  { id: "d1", name: "Priya Sharma", phone: "+91 98765 43210", vehicle: "She Auto", plate: "DL 01 AB 4521", rating: 4.92, trips: 1248, status: "online", kycStatus: "approved", joinedAt: "Jan 2024" },
  { id: "d2", name: "Neha Verma", phone: "+91 91234 56789", vehicle: "She Go", plate: "DL 02 CD 8890", rating: 4.85, trips: 892, status: "busy", kycStatus: "approved", joinedAt: "Mar 2024" },
  { id: "d3", name: "Kavita Singh", phone: "+91 99887 66554", vehicle: "She Auto", plate: "DL 03 EF 1122", rating: 0, trips: 0, status: "offline", kycStatus: "pending", joinedAt: "May 2026" },
  { id: "d4", name: "Ritu Malhotra", phone: "+91 97654 32109", vehicle: "Bike", plate: "DL 04 GH 3344", rating: 4.78, trips: 456, status: "online", kycStatus: "approved", joinedAt: "Aug 2024" },
  { id: "d5", name: "Sonia Gupta", phone: "+91 96543 21098", vehicle: "She Go", plate: "DL 05 IJ 5566", rating: 0, trips: 0, status: "inactive", kycStatus: "rejected", joinedAt: "Apr 2026" },
];

export const adminRiders: AdminRider[] = [
  { id: "r1", name: "Ananya Kapoor", phone: "+91 98765 43210", email: "ananya@email.com", totalRides: 86, rating: 4.9, status: "active", joinedAt: "Jan 2024" },
  { id: "r2", name: "Meera Shah", phone: "+91 91234 56780", email: "meera@email.com", totalRides: 42, rating: 4.8, status: "active", joinedAt: "Jun 2024" },
  { id: "r3", name: "Sneha Reddy", phone: "+91 99876 54321", email: "sneha@email.com", totalRides: 120, rating: 4.95, status: "inactive", joinedAt: "Nov 2023" },
];

export const adminRides: AdminRide[] = [
  { id: "RD-8821", riderName: "Ananya K.", driverName: "Priya S.", pickup: "ITL Twin Tower", dropoff: "Sector 18 Metro", fare: 156, distance: "5.2 km", status: "in_progress", createdAt: "Today, 2:40 PM" },
  { id: "RD-8820", riderName: "Meera S.", driverName: "Neha V.", pickup: "DLF Mall", dropoff: "Botanical Garden", fare: 124, distance: "4.1 km", status: "completed", createdAt: "Today, 1:15 PM" },
  { id: "RD-8819", riderName: "Sneha R.", driverName: "Ritu M.", pickup: "Connaught Place", dropoff: "Airport T3", fare: 489, distance: "18 km", status: "cancelled", createdAt: "Today, 11:00 AM" },
];

export const adminSosAlerts: AdminSosAlert[] = [
  { id: "sos-1", rideId: "RD-8819", riderName: "Sneha R.", driverName: "Ritu M.", location: "NH-48, Gurgaon", status: "critical", triggeredAt: "8 min ago" },
  { id: "sos-2", rideId: "RD-8812", riderName: "Kavya M.", driverName: "Priya S.", location: "Sector 62, Noida", status: "resolved", triggeredAt: "Yesterday" },
];

export const adminTransactions: AdminTransaction[] = [
  { id: "tx-1", type: "payout", party: "Priya Sharma", amount: 12500, status: "completed", date: "Today" },
  { id: "tx-2", type: "fare", party: "Ananya Kapoor", amount: 156, status: "completed", date: "Today" },
  { id: "tx-3", type: "refund", party: "Sneha Reddy", amount: 89, status: "pending", date: "Yesterday" },
  { id: "tx-4", type: "fee", party: "Platform", amount: 450, status: "completed", date: "Yesterday" },
];

export const adminTickets: AdminTicket[] = [
  { id: "TK-1001", subject: "Driver did not arrive", user: "Ananya Kapoor", role: "rider", status: "open", priority: "high", updatedAt: "10 min ago" },
  { id: "TK-1002", subject: "Payout not received", user: "Priya Sharma", role: "captain", status: "in_progress", priority: "medium", updatedAt: "1 hr ago" },
  { id: "TK-1003", subject: "Wrong fare charged", user: "Meera Shah", role: "rider", status: "resolved", priority: "low", updatedAt: "Yesterday" },
];

export const promoCampaigns = [
  { id: "p1", code: "SHE20", discount: "20% off", usage: 1240, status: "active" as const },
  { id: "p2", code: "FIRST50", discount: "₹50 off first ride", usage: 890, status: "active" as const },
];
