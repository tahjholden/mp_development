'use client';

import React, { useState } from 'react';
import UniversalButton from '@/components/ui/UniversalButton';
import UniversalCard, { CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/UniversalCard';
import UniversalModal, { Modal } from '@/components/ui/UniversalModal';

export default function ComponentsShowcase() {
  // State for modals
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Mock loading state
  const [loading, setLoading] = useState(false);

  // Mock form data
  const [formName, setFormName] = useState('');

  // Mock handlers
  const handleDelete = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessModalOpen(true);
    }, 1000);
  };

  const handleArchive = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessModalOpen(true);
    }, 1000);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessModalOpen(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-gold-500">Universal Components Showcase</h1>
      
      {/* Buttons Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 border-b border-zinc-800 pb-2">Universal Buttons</h2>
        
        <div className="space-y-8">
          {/* Primary Buttons */}
          <div>
            <h3 className="text-xl font-medium mb-4">Primary Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <UniversalButton.Primary>Primary</UniversalButton.Primary>
              <UniversalButton.Danger>Danger</UniversalButton.Danger>
              <UniversalButton.Success>Success</UniversalButton.Success>
              <UniversalButton.Warning>Warning</UniversalButton.Warning>
              <UniversalButton.Archive>Archive</UniversalButton.Archive>
              <UniversalButton.Gray>Gray</UniversalButton.Gray>
            </div>
          </div>

          {/* Outline Buttons */}
          <div>
            <h3 className="text-xl font-medium mb-4">Outline Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <UniversalButton.Secondary>Secondary</UniversalButton.Secondary>
              <UniversalButton.DangerOutline>Danger Outline</UniversalButton.DangerOutline>
              <UniversalButton.SuccessOutline>Success Outline</UniversalButton.SuccessOutline>
              <UniversalButton.WarningOutline>Warning Outline</UniversalButton.WarningOutline>
              <UniversalButton.ArchiveOutline>Archive Outline</UniversalButton.ArchiveOutline>
              <UniversalButton.GrayOutline>Gray Outline</UniversalButton.GrayOutline>
            </div>
          </div>

          {/* Ghost & Text Buttons */}
          <div>
            <h3 className="text-xl font-medium mb-4">Ghost & Text Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <UniversalButton.Ghost>Ghost</UniversalButton.Ghost>
              <UniversalButton.Text>Text Button</UniversalButton.Text>
            </div>
          </div>

          {/* Button Sizes */}
          <div>
            <h3 className="text-xl font-medium mb-4">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <UniversalButton.Primary size="xs">Extra Small</UniversalButton.Primary>
              <UniversalButton.Primary size="sm">Small</UniversalButton.Primary>
              <UniversalButton.Primary size="md">Medium</UniversalButton.Primary>
              <UniversalButton.Primary size="lg">Large</UniversalButton.Primary>
              <UniversalButton.Primary size="xl">Extra Large</UniversalButton.Primary>
            </div>
          </div>

          {/* Loading State */}
          <div>
            <h3 className="text-xl font-medium mb-4">Loading State</h3>
            <div className="flex flex-wrap gap-4">
              <UniversalButton.Primary loading>Loading</UniversalButton.Primary>
              <UniversalButton.Danger loading>Deleting...</UniversalButton.Danger>
              <UniversalButton.Success loading>Saving...</UniversalButton.Success>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 border-b border-zinc-800 pb-2">Universal Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Default Card */}
          <UniversalCard.Default
            title="Default Card"
            subtitle="With title and subtitle"
          >
            <p>This is a default card with a title and subtitle.</p>
          </UniversalCard.Default>

          {/* Bordered Card */}
          <UniversalCard.Bordered
            title="Bordered Card"
            subtitle="With transparent background"
          >
            <p>This card has a border but transparent background.</p>
          </UniversalCard.Bordered>

          {/* Elevated Card */}
          <UniversalCard.Elevated
            title="Elevated Card"
            subtitle="With shadow effect"
          >
            <p>This card has elevation with a shadow effect.</p>
          </UniversalCard.Elevated>

          {/* Color Variants */}
          <UniversalCard.Gold
            title="Gold Card"
            subtitle="Brand primary color"
          >
            <p>Card with gold accent color.</p>
          </UniversalCard.Gold>

          <UniversalCard.Danger
            title="Danger Card"
            subtitle="For errors or warnings"
          >
            <p>Card with danger accent color.</p>
          </UniversalCard.Danger>

          <UniversalCard.Success
            title="Success Card"
            subtitle="For successful operations"
          >
            <p>Card with success accent color.</p>
          </UniversalCard.Success>

          {/* Interactive Cards */}
          <UniversalCard.Hoverable
            title="Hoverable Card"
            subtitle="Hover to see effect"
          >
            <p>This card highlights on hover.</p>
          </UniversalCard.Hoverable>

          <UniversalCard.Scalable
            title="Scalable Card"
            subtitle="Hover to see effect"
          >
            <p>This card scales slightly on hover.</p>
          </UniversalCard.Scalable>

          {/* Card with Footer */}
          <UniversalCard.Default
            title="Card with Footer"
            subtitle="And action buttons"
            footer={
              <div className="flex justify-between w-full">
                <UniversalButton.Ghost size="sm">Cancel</UniversalButton.Ghost>
                <UniversalButton.Primary size="sm">Save</UniversalButton.Primary>
              </div>
            }
          >
            <p>This card includes a footer with action buttons.</p>
          </UniversalCard.Default>

          {/* Specialized Cards */}
          <UniversalCard.PlayerCard
            title="Player Card"
            subtitle="Specialized for players"
          >
            <p>A specialized card for displaying player information.</p>
          </UniversalCard.PlayerCard>

          <UniversalCard.StatCard
            title="Stat Card"
            subtitle="For displaying statistics"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-zinc-400">Points</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Rebounds</p>
                <p className="text-2xl font-bold">10</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Assists</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </UniversalCard.StatCard>

          <UniversalCard.EmptyState>
            <div className="text-center">
              <h3 className="text-lg font-medium">No Data Available</h3>
              <p className="text-zinc-400 mt-2">This is an empty state card example.</p>
              <UniversalButton.Primary size="sm" className="mt-4">Add Data</UniversalButton.Primary>
            </div>
          </UniversalCard.EmptyState>
        </div>
      </section>

      {/* Modals Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 border-b border-zinc-800 pb-2">Universal Modals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Modal */}
          <UniversalCard.Default>
            <CardHeader>
              <CardTitle>Basic Modal</CardTitle>
              <CardDescription>Simple content display</CardDescription>
            </CardHeader>
            <CardContent>
              <p>A basic modal for displaying content.</p>
            </CardContent>
            <CardFooter>
              <UniversalButton.Primary onClick={() => setBasicModalOpen(true)}>
                Open Basic Modal
              </UniversalButton.Primary>
            </CardFooter>
          </UniversalCard.Default>

          {/* Delete Modal */}
          <UniversalCard.Default>
            <CardHeader>
              <CardTitle>Delete Modal</CardTitle>
              <CardDescription>Confirmation for deletion</CardDescription>
            </CardHeader>
            <CardContent>
              <p>A modal for confirming deletion actions.</p>
            </CardContent>
            <CardFooter>
              <UniversalButton.Danger onClick={() => setDeleteModalOpen(true)}>
                Open Delete Modal
              </UniversalButton.Danger>
            </CardFooter>
          </UniversalCard.Default>

          {/* Archive Modal */}
          <UniversalCard.Default>
            <CardHeader>
              <CardTitle>Archive Modal</CardTitle>
              <CardDescription>Confirmation for archiving</CardDescription>
            </CardHeader>
            <CardContent>
              <p>A modal for confirming archive actions.</p>
            </CardContent>
            <CardFooter>
              <UniversalButton.Archive onClick={() => setArchiveModalOpen(true)}>
                Open Archive Modal
              </UniversalButton.Archive>
            </CardFooter>
          </UniversalCard.Default>

          {/* Success Modal */}
          <UniversalCard.Default>
            <CardHeader>
              <CardTitle>Success Modal</CardTitle>
              <CardDescription>For successful operations</CardDescription>
            </CardHeader>
            <CardContent>
              <p>A modal for displaying success messages.</p>
            </CardContent>
            <CardFooter>
              <UniversalButton.Success onClick={() => setSuccessModalOpen(true)}>
                Open Success Modal
              </UniversalButton.Success>
            </CardFooter>
          </UniversalCard.Default>

          {/* Warning Modal */}
          <UniversalCard.Default>
            <CardHeader>
              <CardTitle>Warning Modal</CardTitle>
              <CardDescription>For cautionary messages</CardDescription>
            </CardHeader>
            <CardContent>
              <p>A modal for displaying warning messages.</p>
            </CardContent>
            <CardFooter>
              <UniversalButton.Warning onClick={() => setWarningModalOpen(true)}>
                Open Warning Modal
              </UniversalButton.Warning>
            </CardFooter>
          </UniversalCard.Default>

          {/* Form Modal */}
          <UniversalCard.Default>
            <CardHeader>
              <CardTitle>Form Modal</CardTitle>
              <CardDescription>For data entry</CardDescription>
            </CardHeader>
            <CardContent>
              <p>A modal containing a form for data entry.</p>
            </CardContent>
            <CardFooter>
              <UniversalButton.Primary onClick={() => setAddModalOpen(true)}>
                Open Add Form Modal
              </UniversalButton.Primary>
            </CardFooter>
          </UniversalCard.Default>

          {/* Edit Form Modal */}
          <UniversalCard.Default>
            <CardHeader>
              <CardTitle>Edit Form Modal</CardTitle>
              <CardDescription>For editing existing data</CardDescription>
            </CardHeader>
            <CardContent>
              <p>A modal containing a form for editing data.</p>
            </CardContent>
            <CardFooter>
              <UniversalButton.Secondary onClick={() => setEditModalOpen(true)}>
                Open Edit Form Modal
              </UniversalButton.Secondary>
            </CardFooter>
          </UniversalCard.Default>
        </div>
      </section>

      {/* Modal Instances */}
      <Modal.Info
        open={basicModalOpen}
        onOpenChange={setBasicModalOpen}
        title="Information Modal"
        description="This is a basic information modal for displaying content."
      >
        <div className="py-4">
          <p>This modal can be used to display any content or information to the user.</p>
          <p className="mt-4">It's perfect for showing details, instructions, or any other content that doesn't require user actions.</p>
        </div>
      </Modal.Info>

      <Modal.Delete
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleDelete}
        loading={loading}
      />

      <Modal.Archive
        open={archiveModalOpen}
        onOpenChange={setArchiveModalOpen}
        title="Archive Item"
        description="Are you sure you want to archive this item? You can restore it later."
        onConfirm={handleArchive}
        loading={loading}
      />

      <Modal.Success
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        title="Operation Successful"
        description="The operation has been completed successfully."
        onConfirm={() => setSuccessModalOpen(false)}
      />

      <Modal.Warning
        open={warningModalOpen}
        onOpenChange={setWarningModalOpen}
        title="Warning"
        description="This action may have unintended consequences. Are you sure you want to proceed?"
        onConfirm={() => setWarningModalOpen(false)}
      />

      <Modal.Add
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        title="Add New Item"
        description="Enter the details for the new item."
        onSubmit={handleSubmit}
        loading={loading}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <input
              id="name"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea
              id="description"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
              placeholder="Enter description"
              rows={3}
            />
          </div>
        </div>
      </Modal.Add>

      <Modal.Edit
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title="Edit Item"
        description="Update the details for this item."
        onSubmit={handleSubmit}
        loading={loading}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
            <input
              id="edit-name"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
              defaultValue="Example Item"
              placeholder="Enter name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
            <textarea
              id="edit-description"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
              defaultValue="This is an example item description."
              placeholder="Enter description"
              rows={3}
            />
          </div>
        </div>
      </Modal.Edit>
    </div>
  );
}
