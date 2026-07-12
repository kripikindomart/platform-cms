'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authService } from '@/lib/api/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowRight, Check, X, Hexagon, Sparkles } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  // Password strength indicator
  const passwordStrength = password
    ? [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /[0-9]/.test(password),
      ].filter(Boolean).length
    : 0;

  const onSubmit = async (data: RegisterFormData) => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      setIsLoading(true);
      await authService.register(data);
      toast.success('Account created successfully! 🎉');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/90 via-blue-600/90 to-indigo-700/90 animate-gradient" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Trusted by 10,000+ teams</span>
            </div>
            
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Join the future<br />
              of content<br />
              management.
            </h1>
            
            <p className="text-xl text-white/80 mb-12 leading-relaxed max-w-md">
              Start your free trial today. No credit card required.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              {[
                { value: '99.9%', label: 'Uptime' },
                { value: '< 100ms', label: 'Response' },
                { value: '24/7', label: 'Support' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#FAFBFC] overflow-y-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-6">
              <Hexagon className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Create your account</h2>
            <p className="text-neutral-600">Start your 14-day free trial</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-neutral-700">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
                disabled={isLoading}
                className="h-12 rounded-xl border-neutral-200 bg-white focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
              />
              {errors.name && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 font-medium"
                >
                  {errors.name.message}
                </motion.p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-neutral-700">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                {...register('email')}
                disabled={isLoading}
                className="h-12 rounded-xl border-neutral-200 bg-white focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
              />
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 font-medium"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-neutral-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                {...register('password')}
                disabled={isLoading}
                className="h-12 rounded-xl border-neutral-200 bg-white focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
              />
              
              {/* Password Strength */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? 'bg-red-500'
                              : passwordStrength === 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1 text-xs">
                    {[
                      { text: 'At least 8 characters', met: password.length >= 8 },
                      { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
                      { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
                      { text: 'Contains number', met: /[0-9]/.test(password) },
                    ].map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-neutral-600">
                        {req.met ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-neutral-400" />
                        )}
                        <span className={req.met ? 'text-green-700 font-medium' : ''}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 font-medium"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="text-sm font-semibold text-neutral-700">
                Confirm password
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="Re-enter your password"
                {...register('password_confirmation')}
                disabled={isLoading}
                className="h-12 rounded-xl border-neutral-200 bg-white focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
              />
              {errors.password_confirmation && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 font-medium"
                >
                  {errors.password_confirmation.message}
                </motion.p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 py-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-neutral-600 leading-relaxed cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-cyan-600 hover:text-cyan-700 font-medium">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-cyan-600 hover:text-cyan-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Create account</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </div>
  );
}
