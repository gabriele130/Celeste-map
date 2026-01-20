import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, KeyRound, Smartphone, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { loginPincodeSchema, loginOtpSchema, forgotPasswordSchema, type LoginPincodeRequest, type LoginOtpRequest, type ForgotPasswordRequest } from "@shared/schema";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const pincodeForm = useForm<LoginPincodeRequest>({
    resolver: zodResolver(loginPincodeSchema),
    defaultValues: {
      connector_uuid: "",
      pincode: "",
    },
  });

  const otpForm = useForm<LoginOtpRequest>({
    resolver: zodResolver(loginOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const pincodeMutation = useMutation({
    mutationFn: async (data: LoginPincodeRequest) => {
      const res = await fetch("/api/auth/login-pincode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: async () => {
      await login();
      toast({ title: "Login successful", description: "Welcome back!" });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Login failed", description: error.message });
    },
  });

  const otpMutation = useMutation({
    mutationFn: async (data: LoginOtpRequest) => {
      const res = await fetch("/api/auth/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: async () => {
      await login();
      toast({ title: "Login successful", description: "Welcome back!" });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Login failed", description: error.message });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Request failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Email sent", description: "Check your inbox for password reset instructions." });
      setForgotPasswordOpen(false);
      forgotPasswordForm.reset();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Request failed", description: error.message });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary text-primary-foreground font-bold text-2xl">
              J
            </div>
          </div>
          <h1 className="text-2xl font-semibold" data-testid="text-login-title">Customer Portal</h1>
          <p className="text-muted-foreground text-sm">Sign in to access your account</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Choose your preferred authentication method</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pincode" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="pincode" data-testid="tab-pincode">
                  <KeyRound className="w-4 h-4 mr-2" />
                  Pincode
                </TabsTrigger>
                <TabsTrigger value="otp" data-testid="tab-otp">
                  <Smartphone className="w-4 h-4 mr-2" />
                  OTP
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pincode">
                <Form {...pincodeForm}>
                  <form onSubmit={pincodeForm.handleSubmit((data) => pincodeMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={pincodeForm.control}
                      name="connector_uuid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Connector UUID</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. 5f3d760d-ade2-4a19-aea4-36e097678ae3" 
                              {...field} 
                              data-testid="input-connector-uuid"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pincodeForm.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your pincode" 
                              {...field} 
                              data-testid="input-pincode"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={pincodeMutation.isPending}
                      data-testid="button-login-pincode"
                    >
                      {pincodeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Sign In with Pincode
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="otp">
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit((data) => otpMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>One-Time Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your OTP code" 
                              {...field} 
                              data-testid="input-otp"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={otpMutation.isPending}
                      data-testid="button-login-otp"
                    >
                      {otpMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Sign In with OTP
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t text-center">
              <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-sm" data-testid="link-forgot-password">
                    <Mail className="w-4 h-4 mr-2" />
                    Forgot your password?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                      Enter your email address and we'll send you instructions to reset your password.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...forgotPasswordForm}>
                    <form onSubmit={forgotPasswordForm.handleSubmit((data) => forgotPasswordMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={forgotPasswordForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="your@email.com" 
                                {...field} 
                                data-testid="input-forgot-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setForgotPasswordOpen(false)}
                          data-testid="button-cancel-forgot"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={forgotPasswordMutation.isPending}
                          data-testid="button-submit-forgot"
                        >
                          {forgotPasswordMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Send Reset Link
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
