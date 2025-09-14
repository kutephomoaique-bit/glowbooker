import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Shield, Lock } from "lucide-react";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const auth = useAuth();
  const { user, adminLoginMutation } = auth;
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in and is admin
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    }
  }, [user, setLocation]);

  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLogin = (data: AdminLoginFormData) => {
    adminLoginMutation.mutate(data, {
      onSuccess: (user) => {
        if (user.role === 'ADMIN') {
          setLocation("/admin");
        } else {
          // Not an admin, redirect to regular user area
          setLocation("/");
        }
      }
    });
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-purple-200 dark:border-purple-800">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Access
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              HOME BASE Beauty Salon Management
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Admin Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="admin@homebase.beauty"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                        data-testid="input-admin-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter admin password"
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 pr-10"
                          data-testid="input-admin-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                disabled={adminLoginMutation.isPending}
                data-testid="button-admin-login"
              >
                {adminLoginMutation.isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Lock className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Access Admin Panel</span>
                  </div>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need customer access?{" "}
              <button
                onClick={() => setLocation("/auth")}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                data-testid="link-customer-login"
              >
                Customer Login
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}