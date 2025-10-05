// Unit Tests for Unlock System
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnlockService } from '@/services/unlockService';
import { WalletService } from '@/services/walletService';
import { JobsService } from '@/services/jobsService';
import { PipelineService } from '@/services/pipelineService';

// Mock Supabase client
const mockSupabase = {
  rpc: vi.fn(),
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn()
    })),
    insert: vi.fn(() => ({
      select: vi.fn(),
      single: vi.fn()
    })),
    update: vi.fn(() => ({
      eq: vi.fn(),
      select: vi.fn(),
      single: vi.fn()
    })),
    delete: vi.fn(() => ({
      eq: vi.fn()
    })),
    upsert: vi.fn(() => ({
      select: vi.fn(),
      single: vi.fn()
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('UnlockService', () => {
  let unlockService: UnlockService;

  beforeEach(() => {
    unlockService = new UnlockService();
    vi.clearAllMocks();
  });

  describe('getUnlockState', () => {
    it('should return unlock state for a profile', async () => {
      const mockState = { basic: true, contact: false };
      mockSupabase.rpc.mockResolvedValue({ data: mockState, error: null });

      const result = await unlockService.getUnlockState('profile-123');

      expect(result).toEqual(mockState);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('rpc_is_unlocked', {
        p_profile: 'profile-123'
      });
    });

    it('should return default state on error', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('Test error') });

      const result = await unlockService.getUnlockState('profile-123');

      expect(result).toEqual({ basic: false, contact: false });
    });
  });

  describe('unlockBasic', () => {
    it('should unlock basic level successfully', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'unlocked_basic', error: null });

      const result = await unlockService.unlockBasic({
        profileId: 'profile-123',
        jobPostingId: 'job-456',
        generalInterest: false
      });

      expect(result).toBe('unlocked_basic');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('rpc_unlock_basic', {
        p_profile: 'profile-123',
        p_idem: expect.any(String),
        p_job: 'job-456',
        p_general: false
      });
    });

    it('should handle insufficient funds', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'insufficient_funds', error: null });

      const result = await unlockService.unlockBasic({
        profileId: 'profile-123',
        generalInterest: true
      });

      expect(result).toBe('insufficient_funds');
    });

    it('should handle already unlocked', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'already_basic', error: null });

      const result = await unlockService.unlockBasic({
        profileId: 'profile-123'
      });

      expect(result).toBe('already_basic');
    });
  });

  describe('unlockContact', () => {
    it('should unlock contact level successfully', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 'unlocked_contact', error: null });

      const result = await unlockService.unlockContact({
        profileId: 'profile-123',
        jobPostingId: 'job-456'
      });

      expect(result).toBe('unlocked_contact');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('rpc_unlock_contact', {
        p_profile: 'profile-123',
        p_idem: expect.any(String),
        p_job: 'job-456',
        p_general: false
      });
    });
  });
});

describe('WalletService', () => {
  let walletService: WalletService;

  beforeEach(() => {
    walletService = new WalletService();
    vi.clearAllMocks();
  });

  describe('getWallet', () => {
    it('should return wallet data', async () => {
      const mockWallet = {
        id: 'wallet-123',
        company_id: 'company-456',
        balance: 10,
        updated_at: '2025-01-29T10:00:00Z'
      };

      mockSupabase.from().select().single.mockResolvedValue({
        data: mockWallet,
        error: null
      });

      const result = await walletService.getWallet();

      expect(result).toEqual(mockWallet);
    });

    it('should return null when no wallet found', async () => {
      mockSupabase.from().select().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });

      const result = await walletService.getWallet();

      expect(result).toBeNull();
    });
  });

  describe('ensureWallet', () => {
    it('should create wallet if not exists', async () => {
      const mockWallet = {
        id: 'wallet-123',
        company_id: 'company-456',
        balance: 0,
        updated_at: '2025-01-29T10:00:00Z'
      };

      mockSupabase.from().upsert().select().single.mockResolvedValue({
        data: mockWallet,
        error: null
      });

      const result = await walletService.ensureWallet();

      expect(result).toEqual(mockWallet);
    });
  });
});

describe('JobsService', () => {
  let jobsService: JobsService;

  beforeEach(() => {
    jobsService = new JobsService();
    vi.clearAllMocks();
  });

  describe('listCompanyJobs', () => {
    it('should return published jobs', async () => {
      const mockJobs = [
        {
          id: 'job-1',
          company_id: 'company-123',
          title: 'Software Developer',
          status: 'published',
          created_at: '2025-01-29T10:00:00Z',
          updated_at: '2025-01-29T10:00:00Z'
        }
      ];

      mockSupabase.from().select().eq().order().mockResolvedValue({
        data: mockJobs,
        error: null
      });

      const result = await jobsService.listCompanyJobs();

      expect(result).toEqual(mockJobs);
    });
  });

  describe('createJob', () => {
    it('should create a new job', async () => {
      const mockJob = {
        id: 'job-123',
        company_id: 'company-456',
        title: 'New Job',
        status: 'published',
        created_at: '2025-01-29T10:00:00Z',
        updated_at: '2025-01-29T10:00:00Z'
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockJob,
        error: null
      });

      const result = await jobsService.createJob({ title: 'New Job' });

      expect(result).toEqual(mockJob);
    });
  });
});

describe('PipelineService', () => {
  let pipelineService: PipelineService;

  beforeEach(() => {
    pipelineService = new PipelineService();
    vi.clearAllMocks();
  });

  describe('loadPipeline', () => {
    it('should load pipeline with stages and items', async () => {
      const mockPipeline = {
        id: 'pipeline-123',
        company_id: 'company-456',
        name: 'Standard',
        created_at: '2025-01-29T10:00:00Z',
        pipeline_stages: [
          {
            id: 'stage-1',
            pipeline_id: 'pipeline-123',
            name: 'Neu',
            position: 1,
            created_at: '2025-01-29T10:00:00Z'
          }
        ]
      };

      const mockItems = [
        {
          id: 'item-1',
          pipeline_id: 'pipeline-123',
          stage_id: 'stage-1',
          company_id: 'company-456',
          profile_id: 'profile-789',
          order_index: 0,
          created_at: '2025-01-29T10:00:00Z',
          profiles: {
            id: 'profile-789',
            full_name: 'John Doe',
            avatar_url: null
          }
        }
      ];

      mockSupabase.rpc.mockResolvedValue({ data: 'pipeline-123', error: null });
      mockSupabase.from().select().single.mockResolvedValue({
        data: mockPipeline,
        error: null
      });
      mockSupabase.from().select().eq().order().mockResolvedValue({
        data: mockItems,
        error: null
      });

      const result = await pipelineService.loadPipeline();

      expect(result).toBeDefined();
      expect(result?.stages).toHaveLength(1);
      expect(result?.items).toHaveLength(1);
    });
  });

  describe('addToPipeline', () => {
    it('should add profile to pipeline', async () => {
      const mockPipeline = {
        id: 'pipeline-123',
        stages: [
          { id: 'stage-1', name: 'Neu', position: 1 }
        ]
      };

      mockSupabase.from().select().single.mockResolvedValue({
        data: mockPipeline,
        error: null
      });
      mockSupabase.from().select().eq().order().limit().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });
      mockSupabase.from().insert().mockResolvedValue({
        data: null,
        error: null
      });

      await pipelineService.addToPipeline({
        profileId: 'profile-123',
        jobPostingId: 'job-456'
      });

      expect(mockSupabase.from().insert).toHaveBeenCalled();
    });
  });
});
