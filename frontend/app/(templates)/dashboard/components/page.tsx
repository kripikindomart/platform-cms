'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Check, X, Loader2, AlertCircle, Info, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';

/**
 * Component Showcase Page
 * Interactive demo of all base UI components
 */

export default function ComponentShowcasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [switchValue, setSwitch Value] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">
            Component Showcase
          </h1>
          <p className="text-lg text-neutral-600">
            Interactive demo of all 17 base UI components with premium styling
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Buttons</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="gradient">Gradient</Button>
                <Button variant="gradient-purple">Purple</Button>
                <Button variant="gradient-success">Success</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="danger">Danger</Button>
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="primary">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Input Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Input Fields</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Default Input
                </label>
                <Input
                  type="text"
                  placeholder="Enter text..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  With Icon
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Disabled
                </label>
                <Input
                  type="text"
                  placeholder="Disabled input"
                  disabled
                />
              </div>
            </div>
          </motion.div>

          {/* Textarea */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Textarea</h2>
            <Textarea
              placeholder="Enter your message..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              rows={5}
            />
            <div className="mt-2 text-sm text-neutral-600">
              {textareaValue.length} characters
            </div>
          </motion.div>

          {/* Select */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Select Dropdown</h2>
            <div className="space-y-4">
              <Select
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={[
                  { value: '', label: 'Select an option...' },
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
              />
              {selectValue && (
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-sm text-indigo-700">
                    Selected: <strong>{selectValue}</strong>
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Switch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Switch</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900">Enable notifications</div>
                  <div className="text-sm text-neutral-600">Receive email updates</div>
                </div>
                <Switch
                  checked={switchValue}
                  onChange={setSwitchValue}
                />
              </div>
              {switchValue && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-green-700">
                    Notifications enabled
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Checkbox */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Checkbox</h2>
            <div className="space-y-3">
              <Checkbox
                label="I agree to the terms and conditions"
                checked={checkboxValue}
                onChange={setCheckboxValue}
              />
              <Checkbox
                label="Subscribe to newsletter"
                checked={false}
                onChange={() => {}}
              />
              <Checkbox
                label="Disabled checkbox"
                checked={false}
                onChange={() => {}}
                disabled
              />
            </div>
          </motion.div>

          {/* Radio Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Radio Group</h2>
            <RadioGroup
              value={radioValue}
              onChange={setRadioValue}
              options={[
                { value: 'option1', label: 'Option 1', description: 'First choice' },
                { value: 'option2', label: 'Option 2', description: 'Second choice' },
                { value: 'option3', label: 'Option 3', description: 'Third choice' },
              ]}
            />
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Badges</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary" size="sm">Small</Badge>
                <Badge variant="success" size="md">Medium</Badge>
                <Badge variant="danger" size="lg">Large</Badge>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Alerts - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Alerts</h2>
          <div className="space-y-3">
            <Alert variant="success">
              <Check className="w-5 h-5" />
              <span>Operation completed successfully!</span>
            </Alert>
            <Alert variant="error">
              <X className="w-5 h-5" />
              <span>An error occurred. Please try again.</span>
            </Alert>
            <Alert variant="warning">
              <AlertCircle className="w-5 h-5" />
              <span>Warning: This action cannot be undone.</span>
            </Alert>
            <Alert variant="info">
              <Info className="w-5 h-5" />
              <span>New updates are available for download.</span>
            </Alert>
          </div>
        </motion.div>

        {/* Tabs - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-6 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Tabs</h2>
          <Tabs
            tabs={['Overview', 'Details', 'Settings']}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
          <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
            <p className="text-neutral-700">
              Content for <strong>Tab {activeTab + 1}</strong>
            </p>
          </div>
        </motion.div>

        {/* Modal Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-6 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Modal</h2>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Example Modal"
          >
            <div className="space-y-4">
              <p className="text-neutral-700">
                This is a premium modal component with backdrop blur and smooth animations.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </div>
          </Modal>
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-6 p-6 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-sm"
        >
          <h2 className="text-xl font-bold text-white mb-4">Usage Example</h2>
          <pre className="text-sm text-neutral-300 overflow-x-auto">
            <code>{`import {
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  RadioGroup,
  Checkbox,
  Badge,
  Alert,
  Tabs,
  Modal,
} from '@/components/ui';

// Button
<Button variant="primary" size="md">
  Click me
</Button>

// Input
<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Switch
<Switch
  checked={enabled}
  onChange={setEnabled}
/>

// Alert
<Alert variant="success">
  <Check className="w-5 h-5" />
  <span>Success message</span>
</Alert>`}</code>
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
