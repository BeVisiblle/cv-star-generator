// Secure API Service for handling sensitive operations
import { supabase } from '@/integrations/supabase/client';

interface SecurityAuditEvent {
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

class SecureApiService {
  /**
   * Securely fetch candidate data for authorized company members
   */
  async getAuthorizedCandidates(companyId: string) {
    try {
      const { data, error } = await supabase.rpc('get_authorized_candidates', {
        p_company_id: companyId,
        p_requester_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      // Log the access
      await this.logSecurityEvent({
        action: 'candidate_data_access',
        resourceType: 'candidates',
        resourceId: companyId,
        metadata: { count: data?.length || 0 }
      });

      return data;
    } catch (error) {
      console.error('Error fetching authorized candidates:', error);
      await this.logSecurityEvent({
        action: 'candidate_data_access_denied',
        resourceType: 'candidates',
        resourceId: companyId,
        metadata: { error: error.message }
      });
      throw error;
    }
  }

  /**
   * Securely fetch application data for authorized company members
   */
  async getAuthorizedApplications(companyId: string) {
    try {
      const { data, error } = await supabase.rpc('get_authorized_applications', {
        p_company_id: companyId,
        p_requester_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      // Log the access
      await this.logSecurityEvent({
        action: 'application_data_access',
        resourceType: 'applications',
        resourceId: companyId,
        metadata: { count: data?.length || 0 }
      });

      return data;
    } catch (error) {
      console.error('Error fetching authorized applications:', error);
      await this.logSecurityEvent({
        action: 'application_data_access_denied',
        resourceType: 'applications',
        resourceId: companyId,
        metadata: { error: error.message }
      });
      throw error;
    }
  }

  /**
   * Securely fetch company people data
   */
  async getCompanyPeopleSecure(companyId: string) {
    try {
      const { data, error } = await supabase.rpc('company_people_secure', {
        p_company_id: companyId
      });

      if (error) throw error;

      // Log the access
      await this.logSecurityEvent({
        action: 'company_people_access',
        resourceType: 'company_people',
        resourceId: companyId,
        metadata: { count: data?.length || 0 }
      });

      return data;
    } catch (error) {
      console.error('Error fetching company people:', error);
      await this.logSecurityEvent({
        action: 'company_people_access_denied',
        resourceType: 'company_people',
        resourceId: companyId,
        metadata: { error: error.message }
      });
      throw error;
    }
  }

  /**
   * Update user consent for public data visibility
   */
  async updateDataConsent(consentData: {
    publicEmploymentVisible: boolean;
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
  }) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          public_employment_visible: consentData.publicEmploymentVisible,
          data_processing_consent: consentData.dataProcessingConsent,
          marketing_consent: consentData.marketingConsent,
          consent_date: new Date().toISOString()
        })
        .eq('id', user.user.id);

      if (error) throw error;

      // Log the consent update
      await this.logSecurityEvent({
        action: 'data_consent_updated',
        resourceType: 'profile',
        resourceId: user.user.id,
        metadata: consentData
      });

      return true;
    } catch (error) {
      console.error('Error updating data consent:', error);
      throw error;
    }
  }

  /**
   * Request data deletion (GDPR compliance)
   */
  async requestDataDeletion() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Set data retention date to 30 days from now
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() + 30);

      const { error } = await supabase
        .from('profiles')
        .update({
          seeking: false,
          data_retention_until: retentionDate.toISOString()
        })
        .eq('id', user.user.id);

      if (error) throw error;

      // Log the deletion request
      await this.logSecurityEvent({
        action: 'data_deletion_requested',
        resourceType: 'profile',
        resourceId: user.user.id,
        metadata: { retention_until: retentionDate.toISOString() }
      });

      return true;
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      throw error;
    }
  }

  /**
   * Log security events
   */
  private async logSecurityEvent(event: SecurityAuditEvent) {
    try {
      await supabase.rpc('log_security_event', {
        p_action: event.action,
        p_resource_type: event.resourceType,
        p_resource_id: event.resourceId || null
      });
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  }

  /**
   * Validate JWT token and user permissions
   */
  async validateUserPermissions(requiredRole?: string) {
    try {
      const { data: user, error } = await supabase.auth.getUser();
      if (error || !user.user) {
        throw new Error('User not authenticated');
      }

      // If role is required, check it
      if (requiredRole) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.user.id)
          .single();

        if (!profile || profile.role !== requiredRole) {
          throw new Error('Insufficient permissions');
        }
      }

      return user.user;
    } catch (error) {
      console.error('Permission validation failed:', error);
      throw error;
    }
  }

  /**
   * Secure file upload with access logging
   */
  async uploadSecureFile(file: File, bucket: string, path: string) {
    try {
      const user = await this.validateUserPermissions();

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Log the file upload
      await this.logSecurityEvent({
        action: 'file_upload',
        resourceType: 'storage',
        resourceId: data.path,
        metadata: { 
          bucket, 
          path: data.path, 
          size: file.size,
          type: file.type 
        }
      });

      return data;
    } catch (error) {
      console.error('Error uploading secure file:', error);
      throw error;
    }
  }

  /**
   * Secure file deletion with access logging
   */
  async deleteSecureFile(bucket: string, path: string) {
    try {
      const user = await this.validateUserPermissions();

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      // Log the file deletion
      await this.logSecurityEvent({
        action: 'file_deletion',
        resourceType: 'storage',
        resourceId: path,
        metadata: { bucket, path }
      });

      return true;
    } catch (error) {
      console.error('Error deleting secure file:', error);
      throw error;
    }
  }
}

export const secureApiService = new SecureApiService();
export default secureApiService;
