export type FollowEntityType = 'profile' | 'company';
export type FollowStatus = 'pending' | 'accepted' | 'declined';
export type BellPreference = 'all' | 'highlights' | 'off';

export interface FollowRelation {
  id: string;
  follower_id: string;
  follower_type: FollowEntityType;
  followee_id: string;
  followee_type: FollowEntityType;
  status: FollowStatus;
  created_at: string;
  updated_at: string;
}

export interface FollowState {
  following: boolean;
  status: FollowStatus;
  bell: BellPreference;
  loading: boolean;
}

export interface FollowButtonProps {
  companyId?: string;
  profileId?: string;
  mode?: 'profile-to-company' | 'company-to-profile';
  initialFollowing?: boolean;
  initialStatus?: FollowStatus;
  initialBell?: BellPreference;
  onChange?: (state: FollowState) => void;
}

export interface FollowPreference {
  id: string;
  company_id: string;
  profile_id: string;
  bell: BellPreference;
  created_at: string;
  updated_at: string;
}