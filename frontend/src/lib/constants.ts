import {
  LayoutDashboard,
  Activity,
  Target,
  Sparkles,
  Users,
  BarChart3,
  Settings,
  Trophy,
  Car,
  Zap,
  Utensils,
  Droplets,
  Trash2,
  ShoppingBag,
  Monitor
} from "lucide-react";

export const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Activity, label: "Activities", href: "/activities" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Sparkles, label: "AI Coach", href: "/coach" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Users, label: "Community", href: "/community" },
  { icon: Trophy, label: "Challenges", href: "/challenges" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; gradient: string }
> = {
  transport: {
    icon: Car,
    color: "#3B82F6",
    gradient: "from-blue-500/20 to-blue-600/5",
  },
  energy: {
    icon: Zap,
    color: "#F59E0B",
    gradient: "from-amber-500/20 to-amber-600/5",
  },
  food: {
    icon: Utensils,
    color: "#10B981",
    gradient: "from-emerald-500/20 to-emerald-600/5",
  },
  waste: {
    icon: Trash2,
    color: "#8B5CF6",
    gradient: "from-violet-500/20 to-violet-600/5",
  },
  water: {
    icon: Droplets,
    color: "#06B6D4",
    gradient: "from-cyan-500/20 to-cyan-600/5",
  },
  shopping: {
    icon: ShoppingBag,
    color: "#EC4899",
    gradient: "from-pink-500/20 to-pink-600/5",
  },
  digital: {
    icon: Monitor,
    color: "#6366F1",
    gradient: "from-indigo-500/20 to-indigo-600/5",
  },
};
