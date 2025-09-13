import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, Settings, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect" data-testid="navigation-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-logo">
            <div className="w-10 h-10 luxury-gradient rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✨</span>
            </div>
            <span className="text-2xl font-serif font-bold text-primary">HOME BASE</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  isActive(item.href)
                    ? "text-primary font-medium"
                    : "text-foreground hover:text-primary"
                }`}
                data-testid={`link-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/booking">
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-book-now"
              >
                Book Now
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-user-menu">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" data-testid="dropdown-user-menu">
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center" data-testid="link-account">
                      <User className="w-4 h-4 mr-2" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center" data-testid="link-my-bookings">
                      <Calendar className="w-4 h-4 mr-2" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center" data-testid="link-admin">
                        <Settings className="w-4 h-4 mr-2" />
                        HOME BASE Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" className="flex items-center" data-testid="link-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" asChild data-testid="button-login">
                <a href="/api/login">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </a>
              </Button>
            )}
          </div>
          
          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent data-testid="sheet-mobile-menu">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-lg transition-colors ${
                      isActive(item.href)
                        ? "text-primary font-medium"
                        : "text-foreground hover:text-primary"
                    }`}
                    data-testid={`mobile-link-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="pt-4 space-y-2">
                  <Link href="/booking" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" data-testid="mobile-button-book-now">
                      Book Now
                    </Button>
                  </Link>
                  
                  {isAuthenticated ? (
                    <>
                      <Link href="/account" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full justify-start" data-testid="mobile-link-account">
                          <User className="w-4 h-4 mr-2" />
                          My Account
                        </Button>
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full justify-start" data-testid="mobile-link-admin">
                            <Settings className="w-4 h-4 mr-2" />
                            HOME BASE Admin
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        asChild
                        data-testid="mobile-button-logout"
                      >
                        <a href="/api/logout">
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </a>
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" className="w-full justify-start" asChild data-testid="mobile-button-login">
                      <a href="/api/login">
                        <User className="w-4 h-4 mr-2" />
                        Login
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
