'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Download, Trash2, Edit, Eye } from 'lucide-react';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  CustomSelect,
  Switch,
  RadioGroup,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Pagination,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
} from '@/components/ui';

export default function ComponentsPage() {
  const [switchValue, setSwitchValue] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [tabValue, setTabValue] = useState('preview');
  const [selectValue, setSelectValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">UI Components</h1>
            <p className="text-neutral-600 mt-0.5">
              Premium component library untuk generator
            </p>
          </div>
        </div>
      </motion.div>

      {/* Alerts */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Alerts</h2>
        <div className="grid gap-4">
          <Alert variant="success">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your changes have been saved successfully.
            </AlertDescription>
          </Alert>

          <Alert variant="error" dismissible onDismiss={() => console.log('dismissed')}>
            <AlertTitle>Error occurred</AlertTitle>
            <AlertDescription>
              There was a problem processing your request.
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action cannot be undone. Please proceed with caution.
            </AlertDescription>
          </Alert>

          <Alert variant="info">
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Your free trial will expire in 7 days.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Form Components */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Form Components</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
            />
          </div>

          {/* Select */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              id="country"
              options={[
                { value: '', label: 'Select a country' },
                { value: 'id', label: 'Indonesia' },
                { value: 'us', label: 'United States' },
                { value: 'uk', label: 'United Kingdom' },
              ]}
            />
          </div>

          {/* Custom Select */}
          <div className="space-y-2 md:col-span-2">
            <Label>Role (Custom Select)</Label>
            <CustomSelect
              value={selectValue}
              onValueChange={setSelectValue}
              placeholder="Select a role"
              options={[
                { value: 'admin', label: 'Administrator', description: 'Full access to all features' },
                { value: 'editor', label: 'Editor', description: 'Can edit and publish content' },
                { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
              ]}
            />
          </div>

          {/* Textarea */}
          <div className="md:col-span-2 space-y-2">
            <Textarea
              label="Description"
              placeholder="Enter a description..."
              helperText="Maximum 500 characters"
              rows={4}
            />
          </div>
        </div>
      </section>

      {/* Switch */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Switch</h2>
        <div className="space-y-4">
          <Switch
            checked={switchValue}
            onCheckedChange={setSwitchValue}
            label="Enable notifications"
            description="Receive email notifications about your account activity"
          />
          <Switch
            checked={true}
            label="Two-factor authentication"
            description="Add an extra layer of security to your account"
          />
        </div>
      </section>

      {/* Radio Group */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Radio Group</h2>
        <RadioGroup
          value={radioValue}
          onValueChange={setRadioValue}
          name="plan"
          options={[
            {
              value: 'option1',
              label: 'Starter Plan',
              description: 'Perfect for individuals and small teams',
            },
            {
              value: 'option2',
              label: 'Pro Plan',
              description: 'For growing businesses and teams',
            },
            {
              value: 'option3',
              label: 'Enterprise',
              description: 'Advanced features for large organizations',
            },
          ]}
        />
      </section>

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Tabs</h2>
        <Tabs value={tabValue} onValueChange={setTabValue}>
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <div className="p-6 bg-white rounded-xl border border-neutral-200">
              <p className="text-neutral-600">Preview content goes here...</p>
            </div>
          </TabsContent>
          <TabsContent value="code">
            <div className="p-6 bg-neutral-900 rounded-xl">
              <code className="text-green-400 text-sm">
                console.log('Hello World');
              </code>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="p-6 bg-white rounded-xl border border-neutral-200">
              <p className="text-neutral-600">Settings content goes here...</p>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Table</h2>
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
                { name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active' },
                { name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive' },
              ].map((user, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        user.status === 'Active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Pagination */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Pagination</h2>
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={10}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            With Icon
          </Button>
        </div>
      </section>

      {/* Modal */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Modal</h2>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>

        <Modal open={modalOpen} onOpenChange={setModalOpen}>
          <ModalHeader onClose={() => setModalOpen(false)}>
            <ModalTitle>Create New Project</ModalTitle>
            <ModalDescription>
              Enter the details for your new project
            </ModalDescription>
          </ModalHeader>
          <ModalContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input id="project-name" placeholder="My Awesome Project" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-desc">Description</Label>
                <Textarea
                  id="project-desc"
                  placeholder="Describe your project..."
                  rows={3}
                />
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Create Project</Button>
          </ModalFooter>
        </Modal>
      </section>
    </div>
  );
}
