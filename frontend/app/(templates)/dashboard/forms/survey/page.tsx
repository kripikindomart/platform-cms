'use client';

import { useState } from 'react';
import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { FormSection, FormField, StepIndicator, FormSuccess } from '@/components/templates/forms';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { ClipboardList, User, ThumbsUp, MessageSquare, Loader2 } from 'lucide-react';

const steps = [
  { id: '1', title: 'About You', description: 'Basic info' },
  { id: '2', title: 'Experience', description: 'Your feedback' },
  { id: '3', title: 'Comments', description: 'Additional thoughts' },
];

export default function SurveyFormPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    age: '',
    occupation: '',
  });

  const [experienceData, setExperienceData] = useState({
    satisfaction: '',
    recommendation: '',
    usageFrequency: '',
  });

  const [commentsData, setCommentsData] = useState({
    likes: '',
    improvements: '',
    additionalComments: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePersonal = () => {
    const newErrors: Record<string, string> = {};
    if (!personalData.name) newErrors.name = 'Name is required';
    if (!personalData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(personalData.email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateExperience = () => {
    const newErrors: Record<string, string> = {};
    if (!experienceData.satisfaction) newErrors.satisfaction = 'Please rate your satisfaction';
    if (!experienceData.recommendation) newErrors.recommendation = 'Please select an option';
    if (!experienceData.usageFrequency) newErrors.usageFrequency = 'Please select frequency';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 0 && !validatePersonal()) return;
    if (currentStep === 1 && !validateExperience()) return;
    
    if (currentStep === 2) {
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
              title="Survey Submitted!"
              message="Thank you for your valuable feedback. Your responses help us improve our service."
              actionLabel="Submit Another Response"
              onAction={() => {
                setIsSuccess(false);
                setCurrentStep(0);
                setPersonalData({ name: '', email: '', age: '', occupation: '' });
                setExperienceData({ satisfaction: '', recommendation: '', usageFrequency: '' });
                setCommentsData({ likes: '', improvements: '', additionalComments: '' });
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
              Customer Survey
            </h1>
            <p className="text-neutral-600">
              Help us improve by sharing your experience with our service.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>

          {/* Step 1: Personal Info */}
          {currentStep === 0 && (
            <FormSection
              title="About You"
              description="Tell us a bit about yourself"
              icon={User}
            >
              <FormField label="Full Name" required error={errors.name}>
                <Input
                  value={personalData.name}
                  onChange={(e) =>
                    setPersonalData({ ...personalData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>

              <FormField label="Email Address" required error={errors.email}>
                <Input
                  type="email"
                  value={personalData.email}
                  onChange={(e) =>
                    setPersonalData({ ...personalData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Age">
                  <Input
                    type="number"
                    value={personalData.age}
                    onChange={(e) =>
                      setPersonalData({ ...personalData, age: e.target.value })
                    }
                    placeholder="25"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
                <FormField label="Occupation">
                  <Input
                    value={personalData.occupation}
                    onChange={(e) =>
                      setPersonalData({ ...personalData, occupation: e.target.value })
                    }
                    placeholder="Software Engineer"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNext}
                  className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
                >
                  Next Step
                </Button>
              </div>
            </FormSection>
          )}

          {/* Step 2: Experience */}
          {currentStep === 1 && (
            <FormSection
              title="Your Experience"
              description="Rate your experience with our service"
              icon={ThumbsUp}
            >
              <FormField
                label="How satisfied are you with our service?"
                required
                error={errors.satisfaction}
              >
                <RadioGroup
                  value={experienceData.satisfaction}
                  onValueChange={(value) =>
                    setExperienceData({ ...experienceData, satisfaction: value })
                  }
                  name="satisfaction"
                  options={[
                    { value: 'very-satisfied', label: 'Very Satisfied' },
                    { value: 'satisfied', label: 'Satisfied' },
                    { value: 'neutral', label: 'Neutral' },
                    { value: 'dissatisfied', label: 'Dissatisfied' },
                    { value: 'very-dissatisfied', label: 'Very Dissatisfied' },
                  ]}
                />
              </FormField>

              <FormField
                label="Would you recommend us to others?"
                required
                error={errors.recommendation}
              >
                <RadioGroup
                  value={experienceData.recommendation}
                  onValueChange={(value) =>
                    setExperienceData({ ...experienceData, recommendation: value })
                  }
                  name="recommendation"
                  options={[
                    { value: 'definitely', label: 'Definitely' },
                    { value: 'probably', label: 'Probably' },
                    { value: 'not-sure', label: 'Not Sure' },
                    { value: 'probably-not', label: 'Probably Not' },
                    { value: 'definitely-not', label: 'Definitely Not' },
                  ]}
                />
              </FormField>

              <FormField
                label="How often do you use our service?"
                required
                error={errors.usageFrequency}
              >
                <RadioGroup
                  value={experienceData.usageFrequency}
                  onValueChange={(value) =>
                    setExperienceData({ ...experienceData, usageFrequency: value })
                  }
                  name="usageFrequency"
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'rarely', label: 'Rarely' },
                  ]}
                />
              </FormField>

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
                  Next Step
                </Button>
              </div>
            </FormSection>
          )}

          {/* Step 3: Comments */}
          {currentStep === 2 && (
            <FormSection
              title="Additional Comments"
              description="Share your thoughts and suggestions"
              icon={MessageSquare}
            >
              <FormField label="What do you like most about our service?">
                <Textarea
                  value={commentsData.likes}
                  onChange={(e) =>
                    setCommentsData({ ...commentsData, likes: e.target.value })
                  }
                  placeholder="Tell us what you love..."
                  rows={4}
                  className="rounded-xl border-neutral-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>

              <FormField label="What could we improve?">
                <Textarea
                  value={commentsData.improvements}
                  onChange={(e) =>
                    setCommentsData({ ...commentsData, improvements: e.target.value })
                  }
                  placeholder="Share your suggestions..."
                  rows={4}
                  className="rounded-xl border-neutral-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>

              <FormField label="Any additional comments?">
                <Textarea
                  value={commentsData.additionalComments}
                  onChange={(e) =>
                    setCommentsData({
                      ...commentsData,
                      additionalComments: e.target.value,
                    })
                  }
                  placeholder="Anything else you'd like to share..."
                  rows={4}
                  className="rounded-xl border-neutral-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>

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
                      Submitting...
                    </>
                  ) : (
                    'Submit Survey'
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
