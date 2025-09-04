import { supabase } from '@/lib/supabase';
import type { Group, GroupMember, Post } from '@/types/groups';

export interface CreateGroupData {
  title: string;
  description: string;
  type: 'study' | 'professional' | 'interest';
  visibility: 'public' | 'private';
  tags: string[];
}

export interface CreatePostData {
  groupId: string;
  title: string;
  content: string;
  type: 'discussion' | 'question' | 'announcement';
  fileId?: string;
}

export async function createGroup(data: CreateGroupData): Promise<{ success: boolean; groupId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        title: data.title,
        description: data.description,
        type: data.type,
        visibility: data.visibility,
        tags: data.tags,
        created_by: user.id,
        member_count: 1
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create group: ${error.message}`);
    }

    // Add creator as admin member
    await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'admin',
        joined_at: new Date().toISOString()
      });

    return { success: true, groupId: group.id };

  } catch (error) {
    console.error('Create group error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function joinGroup(groupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return { success: true }; // Already a member
    }

    // Add member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: user.id,
        role: 'member',
        joined_at: new Date().toISOString()
      });

    if (memberError) {
      throw new Error(`Failed to join group: ${memberError.message}`);
    }

    // Update member count
    await supabase.rpc('increment_member_count', { group_id: groupId });

    return { success: true };

  } catch (error) {
    console.error('Join group error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function leaveGroup(groupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Remove member
    const { error: memberError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id);

    if (memberError) {
      throw new Error(`Failed to leave group: ${memberError.message}`);
    }

    // Update member count
    await supabase.rpc('decrement_member_count', { group_id: groupId });

    return { success: true };

  } catch (error) {
    console.error('Leave group error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function createPost(data: CreatePostData): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user is member of the group
    const { data: membership } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', data.groupId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      throw new Error('You must be a member of this group to create posts');
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        group_id: data.groupId,
        title: data.title,
        content: data.content,
        type: data.type,
        file_id: data.fileId,
        author_id: user.id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return { success: true, postId: post.id };

  } catch (error) {
    console.error('Create post error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function searchGroups(query: string, filters?: {
  type?: string;
  visibility?: string;
  tags?: string[];
}): Promise<{ success: boolean; groups?: Group[]; error?: string }> {
  try {
    let queryBuilder = supabase
      .from('groups')
      .select(`
        *,
        profiles!groups_created_by_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (filters?.type) {
      queryBuilder = queryBuilder.eq('type', filters.type);
    }

    if (filters?.visibility) {
      queryBuilder = queryBuilder.eq('visibility', filters.visibility);
    }

    if (filters?.tags && filters.tags.length > 0) {
      queryBuilder = queryBuilder.overlaps('tags', filters.tags);
    }

    const { data: groups, error } = await queryBuilder;

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    return { success: true, groups: groups || [] };

  } catch (error) {
    console.error('Search groups error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
