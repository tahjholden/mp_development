'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import UniversalModal from '@/components/ui/UniversalModal';
import UniversalButton from '@/components/ui/UniversalButton';
import { cn } from '@/lib/utils';

export interface Team {
  id: string;
  name: string;
}

export interface AddPlayerFormData {
  firstName: string;
  lastName: string;
  teamId: string;
  initialPdp?: string;
}

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddPlayerFormData) => void;
  teams: Team[];
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  teams = [],
}) => {
  const [formData, setFormData] = useState<AddPlayerFormData>({
    firstName: '',
    lastName: '',
    teamId: '',
    initialPdp: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleTeamSelect = (teamId: string) => {
    setFormData((prev) => ({ ...prev, teamId }));
    setIsTeamDropdownOpen(false);
    if (errors.teamId) {
      setErrors((prev) => ({ ...prev, teamId: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.teamId) {
      newErrors.teamId = 'Team selection is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        firstName: '',
        lastName: '',
        teamId: '',
        initialPdp: '',
      });
    }
  };

  const selectedTeam = teams.find((team) => team.id === formData.teamId);

  return (
    <UniversalModal.Basic
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Add New Player"
      className="bg-zinc-900 border border-zinc-800 p-0 w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gold-500 mb-1">
              FIRST NAME <span className="text-gold-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g., Michael"
              className={cn(
                "w-full bg-zinc-800 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gold-500",
                errors.firstName ? "border-danger-500" : "border-zinc-700"
              )}
            />
            {errors.firstName && <p className="mt-1 text-xs text-danger-500">{errors.firstName}</p>}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gold-500 mb-1">
              LAST NAME <span className="text-gold-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g., Jordan"
              className={cn(
                "w-full bg-zinc-800 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gold-500",
                errors.lastName ? "border-danger-500" : "border-zinc-700"
              )}
            />
            {errors.lastName && <p className="mt-1 text-xs text-danger-500">{errors.lastName}</p>}
          </div>
          
          <div>
            <label htmlFor="teamId" className="block text-sm font-medium text-gold-500 mb-1">
              TEAM <span className="text-gold-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                className={cn(
                  "w-full flex items-center justify-between bg-zinc-800 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gold-500",
                  errors.teamId ? "border-danger-500" : "border-zinc-700"
                )}
              >
                <span className={selectedTeam ? "text-white" : "text-zinc-500"}>
                  {selectedTeam ? selectedTeam.name : "Select a team"}
                </span>
                {isTeamDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {isTeamDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md shadow-lg overflow-hidden">
                  <div className="max-h-48 overflow-y-auto py-1">
                    {teams.length > 0 ? (
                      teams.map((team) => (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => handleTeamSelect(team.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm hover:bg-zinc-700",
                            team.id === formData.teamId ? "bg-zinc-700 text-gold-500" : "text-white"
                          )}
                        >
                          {team.name}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-zinc-400">No teams available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.teamId && <p className="mt-1 text-xs text-danger-500">{errors.teamId}</p>}
          </div>
          
          <div>
            <label htmlFor="initialPdp" className="block text-sm font-medium text-gold-500 mb-1">
              INITIAL PDP (OPTIONAL)
            </label>
            <textarea
              id="initialPdp"
              name="initialPdp"
              value={formData.initialPdp}
              onChange={handleChange}
              placeholder="Enter initial development plan for this player..."
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-between gap-4">
          <UniversalButton.Secondary
            type="button"
            onClick={onClose}
            className="flex-1 py-3 uppercase"
          >
            Cancel
          </UniversalButton.Secondary>
          
          <UniversalButton.Primary
            type="submit"
            className="flex-1 py-3 uppercase"
          >
            Add Player
          </UniversalButton.Primary>
        </div>
      </form>
    </UniversalModal.Basic>
  );
};

export default AddPlayerModal;
