import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Users, 
  Star, 
  Settings, 
  Image, 
  MessageSquare, 
  Home,
  LogOut,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Services', href: '/admin/services', icon: Sparkles },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Gallery', href: '/admin/gallery', icon: Image },
    { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
    { name: 'Events', href: '/admin/events', icon: Star },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location === href;
    }
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-backdrop"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} data-testid="admin-sidebar">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/" className="flex items-center space-x-2" data-testid="logo-link">
              <div className="w-8 h-8 luxury-gradient rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✨</span>
              </div>
              <span className="text-lg font-serif font-bold text-primary">Serenity</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              data-testid="close-sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground" data-testid="admin-name">
                  {user?.firstName || 'Admin'}
                </p>
                <p className="text-sm text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2" data-testid="admin-navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive(item.href) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* Footer actions */}
          <div className="p-4 space-y-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground" data-testid="back-to-site">
                <Home className="w-4 h-4 mr-3" />
                Back to Site
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground"
              asChild
              data-testid="logout-button"
            >
              <a href="/api/logout">
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              data-testid="open-sidebar"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Admin Panel
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
