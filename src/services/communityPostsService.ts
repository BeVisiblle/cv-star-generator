// Community Posts Service - Consolidated API
import { supabase } from '@/integrations/supabase/client';

export interface CommunityPost {
  id: string;
  author_id: string;
  author_type: 'user' | 'company';
  user_id?: string;
  company_id?: string;
  content: string;
  body_md?: string;
  media: any[];
  image_url?: string;
  post_type: 'text' | 'image' | 'link' | 'poll' | 'event' | 'job';
  status: 'draft' | 'scheduled' | 'published' | 'archived' | 'deleted';
  visibility: 'public' | 'followers' | 'connections' | 'community_only';
  scheduled_at?: string;
  published_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  job_id?: string;
  applies_enabled: boolean;
  created_at: string;
  updated_at: string;
  author_profile?: {
    id: string;
    vorname: string;
    nachname: string;
    avatar_url?: string;
    status?: string;
    branche?: string;
    ort?: string;
    ausbildungsberuf?: string;
    ausbildungsbetrieb?: string;
    aktueller_beruf?: string;
  };
  author_company?: {
    id: string;
    name: string;
    logo_url?: string;
    industry?: string;
    size_range?: string;
  };
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_type: 'user' | 'company';
  user_id?: string;
  company_id?: string;
  content: string;
  body_md?: string;
  parent_comment_id?: string;
  is_deleted: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author_profile?: {
    id: string;
    vorname: string;
    nachname: string;
    avatar_url?: string;
  };
  author_company?: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

export interface CreatePostData {
  content: string;
  body_md?: string;
  media?: any[];
  image_url?: string;
  post_type?: 'text' | 'image' | 'link' | 'poll' | 'event' | 'job';
  visibility?: 'public' | 'followers' | 'connections' | 'community_only';
  scheduled_at?: string;
  job_id?: string;
  applies_enabled?: boolean;
}

export interface CreateCommentData {
  content: string;
  body_md?: string;
  parent_comment_id?: string;
}

class CommunityPostsService {
  // Get posts with pagination
  async getPosts(params: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'relevant';
    author_type?: 'user' | 'company';
    author_id?: string;
  } = {}) {
    const { page = 0, limit = 20, sort = 'newest', author_type, author_id } = params;
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_user_id_fkey(
          id,
          vorname,
          nachname,
          avatar_url
        )
      `)
      .range(page * limit, (page + 1) * limit - 1);

    // Apply filters
    if (author_id) {
      query = query.eq('user_id', author_id);
    }

    // Apply sorting
    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      // Sort by relevance (combination of engagement and recency)
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    return data as CommunityPost[];
  }

  // Get a single post by ID
  async getPost(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_user_id_fkey(
          id,
          vorname,
          nachname,
          avatar_url
        )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      throw error;
    }

    return data as CommunityPost;
  }

  // Create a new post
  async createPost(postData: CreatePostData, authorType: 'user' | 'company', authorId: string) {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        content: postData.content,
        user_id: authorId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }

    return data as CommunityPost;
  }

  // Update a post
  async updatePost(postId: string, updates: Partial<CreatePostData>) {
    const { data, error } = await supabase
      .from('community_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      throw error;
    }

    return data as CommunityPost;
  }

  // Delete a post (soft delete)
  async deletePost(postId: string) {
    const { error } = await supabase
      .from('community_posts')
      .update({ 
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Get comments for a post
  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('community_comments')
      .select(`
        *,
        author_profile:profiles!community_comments_user_id_fkey(
          id,
          vorname,
          nachname,
          avatar_url
        ),
        author_company:companies!community_comments_company_id_fkey(
          id,
          name,
          logo_url
        )
      `)
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    return data as CommunityComment[];
  }

  // Create a comment
  async createComment(postId: string, commentData: CreateCommentData, authorType: 'user' | 'company', authorId: string) {
    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        ...commentData,
        post_id: postId,
        author_type: authorType,
        author_id: authorId,
        user_id: authorType === 'user' ? authorId : null,
        company_id: authorType === 'company' ? authorId : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      throw error;
    }

    return data as CommunityComment;
  }

  // Like/unlike a post
  async toggleLike(postId: string, likerType: 'user' | 'company', likerId: string) {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('community_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('liker_id', likerId)
      .eq('liker_type', likerType)
      .maybeSingle();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('community_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (error) {
        console.error('Error unliking post:', error);
        throw error;
      }
      
      return { action: 'unliked' };
    } else {
      // Like
      const { error } = await supabase
        .from('community_likes')
        .insert({
          post_id: postId,
          liker_type: likerType,
          liker_id: likerId,
          user_id: likerType === 'user' ? likerId : null,
          company_id: likerType === 'company' ? likerId : null,
        });
      
      if (error) {
        console.error('Error liking post:', error);
        throw error;
      }
      
      return { action: 'liked' };
    }
  }

  // Share a post
  async sharePost(postId: string, sharerType: 'user' | 'company', sharerId: string, sharedContent?: string) {
    const { data, error } = await supabase
      .from('community_shares')
      .insert({
        post_id: postId,
        sharer_type: sharerType,
        sharer_id: sharerId,
        user_id: sharerType === 'user' ? sharerId : null,
        company_id: sharerType === 'company' ? sharerId : null,
        shared_content: sharedContent,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sharing post:', error);
      throw error;
    }

    return data;
  }

  // Get user's posts
  async getUserPosts(userId: string, limit = 20) {
    return this.getPosts({
      author_type: 'user',
      author_id: userId,
      limit,
    });
  }

  // Get company's posts
  async getCompanyPosts(companyId: string, limit = 20) {
    return this.getPosts({
      author_type: 'company',
      author_id: companyId,
      limit,
    });
  }
}

export const communityPostsService = new CommunityPostsService();
