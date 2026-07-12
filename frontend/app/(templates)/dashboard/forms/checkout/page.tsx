'use client';

import { useState } from 'react';
import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { FormSection, FormField, StepIndicator, FormSuccess } from '@/components/templates/forms';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ShoppingCart, CreditCard, Package, Loader2 } from 'lucide-react';

const steps = [
  { id: '1', title: 'Cart', description: 'Review items' },
  { id: '2', title: 'Shipping', description: 'Delivery address' },
  { id: '3', title: 'Payment', description: 'Payment method' },
];

export default function CheckoutFormPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [shippingData, setShippingData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    country: '',
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    if (!shippingData.fullName) newErrors.fullName = 'Full name is required';
    if (!shippingData.email) newErrors.email = 'Email is required';
    if (!shippingData.address) newErrors.address = 'Address is required';
    if (!shippingData.city) newErrors.city = 'City is required';
    if (!shippingData.zip) newErrors.zip = 'ZIP code is required';
    if (!shippingData.country) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors: Record<string, string> = {};
    if (!paymentData.cardNumber) newErrors.cardNumber = 'Card number is required';
    if (!paymentData.cardName) newErrors.cardName = 'Cardholder name is required';
    if (!paymentData.expiry) newErrors.expiry = 'Expiry date is required';
    if (!paymentData.cvv) newErrors.cvv = 'CVV is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 1 && !validateShipping()) return;
    if (currentStep === 2) {
      if (!validatePayment()) return;
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      setIsSuccess(true);
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    setErrors({});
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen bg-[#FAFBFC]">
        <FloatingSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <FormSuccess
              title="Order Placed Successfully!"
              message="Your order #12345 has been confirmed. We'll send you a shipping confirmation email soon."
              actionLabel="Continue Shopping"
              onAction={() => {
                setIsSuccess(false);
                setCurrentStep(0);
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Checkout Form
            </h1>
            <p className="text-neutral-600">
              Multi-step checkout process with validation at each step.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>

          {/* Step Content */}
          {currentStep === 0 && (
            <FormSection
              title="Order Summary"
              description="Review your cart items before checkout"
              icon={ShoppingCart}
            >
              {/* Cart Items */}
              <div className="space-y-3">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl"
                  >
                    <div className="w-20 h-20 rounded-lg bg-neutral-200" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">Product {item}</h4>
                      <p className="text-sm text-neutral-600">Size: M • Color: Blue</p>
                    </div>
                    <p className="text-lg font-bold text-neutral-900">$99.00</p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-semibold text-neutral-900">$198.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-semibold text-neutral-900">$10.00</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-neutral-200">
                  <span className="font-bold text-neutral-900">Total</span>
                  <span className="font-bold text-neutral-900">$208.00</span>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNext}
                  className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
                >
                  Proceed to Shipping
                </Button>
              </div>
            </FormSection>
          )}

          {currentStep === 1 && (
            <FormSection
              title="Shipping Information"
              description="Where should we deliver your order?"
              icon={Package}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormField label="Full Name" required error={errors.fullName}>
                    <Input
                      value={shippingData.fullName}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, fullName: e.target.value })
                      }
                      placeholder="John Doe"
                      className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                    />
                  </FormField>
                </div>
                <div className="md:col-span-2">
                  <FormField label="Email" required error={errors.email}>
                    <Input
                      type="email"
                      value={shippingData.email}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                    />
                  </FormField>
                </div>
                <div className="md:col-span-2">
                  <FormField label="Address" required error={errors.address}>
                    <Input
                      value={shippingData.address}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, address: e.target.value })
                      }
                      placeholder="123 Main Street"
                      className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                    />
                  </FormField>
                </div>
                <FormField label="City" required error={errors.city}>
                  <Input
                    value={shippingData.city}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, city: e.target.value })
                    }
                    placeholder="San Francisco"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
                <FormField label="ZIP Code" required error={errors.zip}>
                  <Input
                    value={shippingData.zip}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, zip: e.target.value })
                    }
                    placeholder="94102"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
                <div className="md:col-span-2">
                  <FormField label="Country" required error={errors.country}>
                    <Select
                      value={shippingData.country}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, country: e.target.value })
                      }
                      options={[
                        { value: '', label: 'Select country' },
                        { value: 'us', label: 'United States' },
                        { value: 'uk', label: 'United Kingdom' },
                        { value: 'ca', label: 'Canada' },
                      ]}
                      className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                    />
                  </FormField>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  onClick={handleBack}
                  className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50 transition-all"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
                >
                  Continue to Payment
                </Button>
              </div>
            </FormSection>
          )}

          {currentStep === 2 && (
            <FormSection
              title="Payment Information"
              description="Enter your payment details securely"
              icon={CreditCard}
            >
              <FormField label="Card Number" required error={errors.cardNumber}>
                <Input
                  value={paymentData.cardNumber}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, cardNumber: e.target.value })
                  }
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>

              <FormField label="Cardholder Name" required error={errors.cardName}>
                <Input
                  value={paymentData.cardName}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, cardName: e.target.value })
                  }
                  placeholder="John Doe"
                  className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Expiry Date" required error={errors.expiry}>
                  <Input
                    value={paymentData.expiry}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, expiry: e.target.value })
                    }
                    placeholder="MM/YY"
                    maxLength={5}
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
                <FormField label="CVV" required error={errors.cvv}>
                  <Input
                    value={paymentData.cvv}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, cvv: e.target.value })
                    }
                    placeholder="123"
                    maxLength={3}
                    type="password"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  onClick={handleBack}
                  className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50 transition-all"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </div>
            </FormSection>
          )}
        </div>
      </main>
    </div>
  );
}
