

'use client';

import Link from 'next/link';
import {
  Monitor,
  Users,
  Megaphone,
  Landmark,
  UserCog,
  LayoutDashboard,
  Map,
  Bell,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/screens', icon: Monitor, label: 'Screens' },
  { href: '/locations', icon: Map, label: 'Locations' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/accounts', icon: Landmark, label: 'Accounts' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/admins', icon: UserCog, label: 'Admins' },
];

export function AppSidebarNav() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href)}
            tooltip={item.label}
            className="group/button h-12 justify-center text-muted-foreground group-data-[collapsible=icon]:p-2.5"
          >
            <Link href={item.href} onClick={handleLinkClick}>
              <item.icon className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
