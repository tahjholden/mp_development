import { createClient } from '@/lib/supabase/server';

/**
 * Types for pack configuration and features
 */
export interface PackConfig {
  id: string;
  version: string;
  schema_version: string;
  prompt_library: any;
  constraint_definitions: any;
  ai_model_config: any;
  active: boolean;
  created_at?: string;
}

export interface PackBehavior {
  type: 'base' | 'enhanced';
  aiEnabled: boolean;
  philosophyOverlay: boolean;
  useCoreLogicOnly: boolean;
  packConfig?: PackConfig | null;
  uiOverrides?: Record<string, string> | null;
  version?: string;
}

export interface PackFeatures {
  // Base features (always available)
  playerManagement: boolean;
  basicObservations: boolean;
  simplePdp: boolean;
  
  // Enhanced features (only with philosophy packs)
  aiEnabled: boolean;
  philosophyOverlay: boolean;
  advancedConstraints: boolean;
  drillRecommendations: boolean;
  
  // UI customization
  uiOverrides?: Record<string, string> | null;
}

/**
 * Get the pack configuration for a specific overlay_version
 */
export const getPackConfig = async (overlayVersion?: string | null): Promise<PackConfig | null> => {
  if (!overlayVersion || overlayVersion === 'mp-basic') {
    return null;
  }

  const supabase = createClient();
  
  // Use the existing mpbc_version_config table
  const { data, error } = await supabase
    .from('mpbc_version_config')
    .select('*')
    .eq('version', overlayVersion)
    .eq('active', true)
    .single();
  
  if (error || !data) {
    console.error('Error fetching pack configuration:', error);
    return null;
  }
  
  return data as PackConfig;
};

/**
 * Get the pack configuration for a specific organization
 */
export const getOrgPackConfig = async (orgId: string): Promise<PackConfig | null> => {
  const supabase = createClient();
  
  // Get the organization's overlay_version
  const { data: org, error: orgError } = await supabase
    .from('mp_core_organizations')
    .select('overlay_version')
    .eq('id', orgId)
    .single();
  
  if (orgError || !org) {
    console.error('Error fetching organization:', orgError);
    return null;
  }
  
  const overlayVersion = org.overlay_version;
  
  // If no overlay_version or it's mp-basic, return null (base functionality)
  if (!overlayVersion || overlayVersion === 'mp-basic') {
    return null;
  }
  
  // Get the pack configuration
  return getPackConfig(overlayVersion);
};

/**
 * Determine the pack behavior based on the organization's overlay_version
 */
export const getPackBehavior = async (orgId: string): Promise<PackBehavior> => {
  const packConfig = await getOrgPackConfig(orgId);
  
  if (!packConfig) {
    // Base functionality - no philosophy overlay, no AI
    return {
      type: 'base',
      aiEnabled: false,
      philosophyOverlay: false,
      useCoreLogicOnly: true,
      uiOverrides: null
    };
  }
  
  // Enhanced functionality with philosophy pack
  const aiEnabled = packConfig.ai_model_config && 
    (packConfig.ai_model_config.enabled === true || 
    packConfig.ai_model_config.enabled === 'true');

  // Extract UI overrides from the config if available
  const uiOverrides = packConfig.constraint_definitions?.ui_overrides || null;

  return {
    type: 'enhanced',
    aiEnabled,
    philosophyOverlay: true,
    useCoreLogicOnly: false,
    packConfig,
    uiOverrides,
    version: packConfig.version
  };
};

/**
 * Get available features based on the organization's pack configuration
 */
export const getPackFeatures = async (orgId: string): Promise<PackFeatures> => {
  const packBehavior = await getPackBehavior(orgId);
  
  // Base features are always available
  const features: PackFeatures = {
    playerManagement: true,
    basicObservations: true,
    simplePdp: true,
    
    // Enhanced features depend on pack configuration
    aiEnabled: packBehavior.aiEnabled,
    philosophyOverlay: packBehavior.type === 'enhanced',
    advancedConstraints: packBehavior.type === 'enhanced',
    drillRecommendations: packBehavior.type === 'enhanced',
    
    // UI customization
    uiOverrides: packBehavior.uiOverrides
  };
  
  return features;
};

/**
 * Check if a specific feature is available for an organization
 */
export const isFeatureAvailable = async (
  orgId: string, 
  feature: keyof PackFeatures
): Promise<boolean> => {
  const features = await getPackFeatures(orgId);
  return !!features[feature];
};

/**
 * Get the GPT prompt modification for a specific organization's pack
 * Returns null for base functionality (no AI)
 */
export const getGptPromptMod = async (orgId: string): Promise<string | null> => {
  const packBehavior = await getPackBehavior(orgId);
  
  if (packBehavior.type === 'base' || !packBehavior.aiEnabled) {
    return null;
  }
  
  const supabase = createClient();
  
  // Get the prompt template for this version
  const { data, error } = await supabase
    .from('mpbc_prompt_templates')
    .select('system_instructions')
    .eq('use_case', 'philosophy_overlay')
    .eq('version', packBehavior.version)
    .eq('active', true)
    .single();
  
  if (error || !data) {
    console.error('Error fetching prompt template:', error);
    return null;
  }
  
  return data.system_instructions;
};

/**
 * Get UI overrides for a specific organization's pack
 * Returns null for base functionality (no UI overrides)
 */
export const getUiOverrides = async (orgId: string): Promise<Record<string, string> | null> => {
  const packBehavior = await getPackBehavior(orgId);
  return packBehavior.uiOverrides;
};

/**
 * Apply pack-specific enhancements to data
 * This is used to add AI analysis, philosophy-specific constraints, etc.
 */
export const applyPackEnhancements = async <T>(
  data: T, 
  orgId: string
): Promise<T & { packEnhancements?: any }> => {
  const packBehavior = await getPackBehavior(orgId);
  
  if (packBehavior.type === 'base') {
    // No enhancements for base functionality
    return data;
  }
  
  // Add pack-specific enhancements
  return {
    ...data,
    packEnhancements: {
      aiEnabled: packBehavior.aiEnabled,
      version: packBehavior.version,
      // Add other pack-specific enhancements here
    }
  };
};

/**
 * Get constraint filters for a specific pack
 */
export const getPackConstraintFilters = async (orgId: string): Promise<string[]> => {
  const packBehavior = await getPackBehavior(orgId);
  
  if (packBehavior.type === 'base') {
    // No constraint filters for base functionality
    return [];
  }
  
  // Extract constraint filters from pack config
  return packBehavior.packConfig?.constraint_definitions?.filters || [];
};

/**
 * Create SQL condition for pack-specific filtering
 * This is useful for database queries that need to filter based on pack configuration
 */
export const createPackFilterCondition = async (
  orgId: string,
  tableAlias: string = 't'
): Promise<string> => {
  const constraintFilters = await getPackConstraintFilters(orgId);
  
  if (constraintFilters.length === 0) {
    // Base functionality - no additional filtering
    return '1=1'; // Always true condition
  }
  
  // Create conditions based on pack configuration
  const constraintList = constraintFilters.map(c => `'${c}'`).join(', ');
  return `${tableAlias}.skill_tag IN (${constraintList})`;
};

/**
 * Get the subscription tier for an organization
 */
export const getSubscriptionTier = async (orgId: string): Promise<string> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('mp_core_organizations')
    .select('subscription_tier')
    .eq('id', orgId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching subscription tier:', error);
    return 'free';
  }
  
  return data.subscription_tier || 'free';
};

/**
 * Check if a feature is available based on subscription tier
 */
export const isFeatureInTier = async (
  orgId: string,
  feature: string
): Promise<boolean> => {
  const tier = await getSubscriptionTier(orgId);
  
  // Define which features are available in which tiers
  const tierFeatures: Record<string, string[]> = {
    free: ['playerManagement', 'basicObservations', 'simplePdp'],
    pro: ['playerManagement', 'basicObservations', 'simplePdp', 'aiEnabled'],
    elite: ['playerManagement', 'basicObservations', 'simplePdp', 'aiEnabled', 'philosophyOverlay', 'advancedConstraints', 'drillRecommendations']
  };
  
  return tierFeatures[tier]?.includes(feature) || false;
};
