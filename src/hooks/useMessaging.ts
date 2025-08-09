import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type SimpleProfile = {
  id: string;
  vorname?: string | null;
  nachname?: string | null;
  avatar_url?: string | null;
};

export type ConversationSummary = {
  id: string;
  otherUser: SimpleProfile;
  lastMessage?: { id: string; content: string; created_at: string; sender_id: string } | null;
  lastMessageAt?: string | null;
};

export const useMessaging = () => {
  const { user } = useAuth();

  const listAcceptedConnections = useCallback(async (): Promise<SimpleProfile[]> => {
    if (!user) return [];
    // Get accepted connections where current user participates
    const { data: cons } = await supabase
      .from("connections")
      .select("requester_id, addressee_id, status")
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    const otherIds = Array.from(new Set((cons || []).map((c: any) => (c.requester_id === user.id ? c.addressee_id : c.requester_id))));
    if (otherIds.length === 0) return [];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, vorname, nachname, avatar_url")
      .in("id", otherIds);

    return (profiles || []) as SimpleProfile[];
  }, [user]);

  const findOrCreateConversation = useCallback(async (withUserId: string): Promise<string> => {
    if (!user) throw new Error("not-authenticated");
    // Try to find existing conversation (order of a/b unknown)
    const { data: existing } = await supabase
      .from("conversations")
      .select("id,a_id,b_id")
      .or(`and(a_id.eq.${user.id},b_id.eq.${withUserId}),and(a_id.eq.${withUserId},b_id.eq.${user.id})`)
      .maybeSingle();

    if (existing?.id) return existing.id as string;

    // Create new conversation (RLS requires users to be connected)
    const { data, error } = await supabase
      .from("conversations")
      .insert({ a_id: user.id, b_id: withUserId })
      .select("id")
      .single();
    if (error) throw error;
    return data!.id as string;
  }, [user]);

  const sendMessage = useCallback(async (toUserId: string, content: string) => {
    if (!user) throw new Error("not-authenticated");
    if (!content.trim()) throw new Error("empty");

    const conversationId = await findOrCreateConversation(toUserId);

    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, content: content.trim() });
    if (error) throw error;

    // Touch conversation last_message_at for ordering (if allowed by RLS UPDATE)
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);

    return conversationId;
  }, [user, findOrCreateConversation]);

  const loadConversationsWithLast = useCallback(async (): Promise<ConversationSummary[]> => {
    if (!user) return [];
    const { data: convs } = await supabase
      .from("conversations")
      .select("id,a_id,b_id,last_message_at")
      .or(`a_id.eq.${user.id},b_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    const list = (convs || []) as any[];
    if (list.length === 0) return [];

    const otherIds = Array.from(new Set(list.map((c) => (c.a_id === user.id ? c.b_id : c.a_id))));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, vorname, nachname, avatar_url")
      .in("id", otherIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    const convIds = list.map((c) => c.id);
    const { data: msgs } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false });
    const latestByConv = new Map<string, any>();
    (msgs || []).forEach((m: any) => {
      if (!latestByConv.has(m.conversation_id)) latestByConv.set(m.conversation_id, m);
    });

    return list.map((c) => ({
      id: c.id,
      otherUser: profileMap.get(c.a_id === user.id ? c.b_id : c.a_id) as SimpleProfile,
      lastMessage: latestByConv.get(c.id) || null,
      lastMessageAt: c.last_message_at ?? (latestByConv.get(c.id)?.created_at ?? null),
    }));
  }, [user]);

  const loadRecentMessages = useCallback(async (limit = 4) => {
    if (!user) return [] as { id: string; content: string; created_at: string; sender_id: string; conversation_id: string }[];

    const { data: convs } = await supabase
      .from("conversations")
      .select("id")
      .or(`a_id.eq.${user.id},b_id.eq.${user.id}`);
    const convIds = (convs || []).map((c: any) => c.id);
    if (convIds.length === 0) return [];

    const { data: msgs } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (msgs || []) as any[];
  }, [user]);

  return { listAcceptedConnections, sendMessage, loadConversationsWithLast, loadRecentMessages };
};
