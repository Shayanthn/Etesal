import { getSupabase } from './supabaseClient';
import { AdminSupportTicket } from '../types/admin';
import { INITIAL_SUPPORT_TICKETS } from '../data/adminData';

const LOCAL_TICKETS_STORAGE_KEY = 'etesal_support_tickets_vault';
export const USER_SUBMITTED_TICKETS_KEY = 'etesal_user_submitted_tickets';

export interface CreateTicketParams {
  subject: string;
  category: AdminSupportTicket['category'];
  operator: AdminSupportTicket['operator'];
  userName: string;
  userEmail?: string;
  telegramUsername?: string;
  message: string;
  userId?: string;
}

export interface TicketOperationResult {
  success: boolean;
  ticket?: AdminSupportTicket;
  tickets?: AdminSupportTicket[];
  error?: string;
}

/**
 * Fetches tickets submitted by a specific logged-in user
 */
export async function fetchUserTickets(userId: string): Promise<AdminSupportTicket[]> {
  const supabase = getSupabase();
  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.ticket_code || item.id,
          subject: item.subject,
          category: item.category || 'connection',
          operator: item.operator || 'mci',
          userName: item.user_name,
          userEmail: item.user_email,
          telegramUsername: item.telegram_username,
          message: item.message,
          status: item.status || 'pending',
          priority: item.priority || 'medium',
          replyMessage: item.reply_message,
          repliedAt: item.replied_at,
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString()
        }));
      }
    } catch {
      // Fallback to local
    }
  }

  const userTickets = getUserSubmittedTickets();
  return userTickets;
}

/**
 * Loads tickets submitted by this user from localStorage
 */
export function getUserSubmittedTickets(): AdminSupportTicket[] {
  try {
    const raw = localStorage.getItem(USER_SUBMITTED_TICKETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AdminSupportTicket[];
  } catch {
    return [];
  }
}

/**
 * Persists a newly submitted ticket in user's local history
 */
export function saveUserSubmittedTicket(ticket: AdminSupportTicket): void {
  try {
    const existing = getUserSubmittedTickets();
    const filtered = existing.filter(t => t.id !== ticket.id);
    localStorage.setItem(USER_SUBMITTED_TICKETS_KEY, JSON.stringify([ticket, ...filtered]));
  } catch {
    // Ignore storage quota error
  }
}

/**
 * Updates a ticket in user's local history (e.g. after fetching admin reply)
 */
export function updateUserSubmittedTicket(updated: AdminSupportTicket): void {
  try {
    const existing = getUserSubmittedTickets();
    const list = existing.map(t => t.id === updated.id ? updated : t);
    localStorage.setItem(USER_SUBMITTED_TICKETS_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota error
  }
}

/**
 * Generate cryptographic human-friendly ticket tracking code (e.g. TCK-A1B2C3D4E5F6)
 */
export function generateTicketCode(): string {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return 'TCK-' + uuid.replace(/-/g, '').substring(0, 20).toUpperCase();
}

/**
 * Retrieves local fallback tickets from storage
 */
function getLocalTicketsVault(): AdminSupportTicket[] {
  try {
    const raw = localStorage.getItem(LOCAL_TICKETS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_TICKETS_STORAGE_KEY, JSON.stringify(INITIAL_SUPPORT_TICKETS));
      return INITIAL_SUPPORT_TICKETS;
    }
    return JSON.parse(raw) as AdminSupportTicket[];
  } catch {
    return INITIAL_SUPPORT_TICKETS;
  }
}

/**
 * Persists local fallback tickets
 */
function saveLocalTicketsVault(tickets: AdminSupportTicket[]): void {
  try {
    localStorage.setItem(LOCAL_TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Ignore storage quota error
  }
}

/**
 * Submits a new support ticket to Supabase or local persistent vault
 */
export async function createSupportTicket(params: CreateTicketParams): Promise<TicketOperationResult> {
  const code = generateTicketCode();
  const now = new Date().toISOString();

  const newTicket: AdminSupportTicket = {
    id: code,
    subject: params.subject.trim(),
    category: params.category,
    operator: params.operator,
    userName: params.userName.trim(),
    userEmail: params.userEmail?.trim() || undefined,
    telegramUsername: params.telegramUsername?.trim() || undefined,
    message: params.message.trim(),
    status: 'pending',
    priority: params.category === 'billing' ? 'high' : 'medium',
    createdAt: now,
    updatedAt: now
  };

  const supabase = getSupabase();

  if (supabase) {
    const insertPayload: any = {
      ticket_code: code,
      user_id: params.userId || null,
      user_name: newTicket.userName,
      user_email: newTicket.userEmail || null,
      telegram_username: newTicket.telegramUsername || null,
      subject: newTicket.subject,
      category: newTicket.category,
      operator: newTicket.operator,
      priority: newTicket.priority,
      status: 'pending',
      message: newTicket.message
    };

    // For unauthenticated guest submissions, do NOT call .select()
    // because PostgreSQL RLS allows anon to INSERT under "Guest Ticket Submission",
    // but anon cannot SELECT from support_tickets directly (only via get_ticket_by_code RPC).
    if (!params.userId) {
      const { error } = await supabase
        .from('support_tickets')
        .insert([insertPayload]);

      if (error) {
        console.error('Supabase createSupportTicket error (guest):', error);
        return { success: false, error: error.message || 'خطا در ثبت تیکت در پایگاه داده' };
      }

      saveUserSubmittedTicket(newTicket);
      return { success: true, ticket: newTicket };
    }

    // For authenticated users
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase createSupportTicket error (authenticated):', error);
      // Retry without select
      const { error: insertErr } = await supabase
        .from('support_tickets')
        .insert([insertPayload]);
      if (insertErr) {
        return { success: false, error: insertErr.message || 'خطا در ثبت تیکت در پایگاه داده' };
      }
    } else if (data) {
      newTicket.id = data.ticket_code || data.id;
    }

    saveUserSubmittedTicket(newTicket);
    return { success: true, ticket: newTicket };
  }

  // Local Offline Mode
  const vault = getLocalTicketsVault();
  saveLocalTicketsVault([newTicket, ...vault]);
  saveUserSubmittedTicket(newTicket);
  return { success: true, ticket: newTicket };
}

/**
 * Fetches ticket by tracking code (uses secure RPC get_ticket_by_code)
 */
export async function fetchTicketByCode(code: string): Promise<AdminSupportTicket | null> {
  const cleanCode = code.trim().toUpperCase();
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_ticket_by_code', { p_ticket_code: cleanCode });
      
      if (!error && data && data.length > 0) {
        const item = data[0];
        const ticket: AdminSupportTicket = {
          id: item.ticket_code,
          subject: item.subject,
          category: item.category || 'connection',
          operator: item.operator || 'mci',
          userName: 'کاربر اتصال',
          message: item.message,
          status: item.status || 'pending',
          priority: 'medium',
          replyMessage: item.reply_message,
          repliedAt: item.replied_at,
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.replied_at || item.created_at || new Date().toISOString()
        };
        updateUserSubmittedTicket(ticket);
        return ticket;
      }
    } catch {
      // Fallback below
    }
  }

  // Local user tickets or offline vault fallback
  const userTickets = getUserSubmittedTickets();
  const userFound = userTickets.find(t => t.id.toUpperCase() === cleanCode);
  if (userFound) return userFound;

  const vault = getLocalTicketsVault();
  const ticket = vault.find(t => t.id === cleanCode || (t as any).ticket_code === cleanCode || (t as any).ticketCode === cleanCode);
  return ticket || null;
}

/**
 * Fetches all tickets (For Master Admin Dashboard)
 */
export async function fetchAllTickets(): Promise<AdminSupportTicket[]> {
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchAllTickets error:', error);
      return [];
    }
    
    if (data) {
      return data.map((item: any) => ({
        id: item.id || item.ticket_code,
        subject: item.subject,
        category: item.category || 'connection',
        operator: item.operator || 'mci',
        userName: item.user_name,
        userEmail: item.user_email,
        telegramUsername: item.telegram_username,
        message: item.message,
        status: item.status || 'pending',
        priority: item.priority || 'medium',
        replyMessage: item.reply_message,
        repliedAt: item.replied_at,
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString()
      }));
    }
    return [];
  }

  return getLocalTicketsVault();
}

/**
 * Replies to a ticket and updates its status
 */
export async function replyToSupportTicket(
  ticketId: string,
  replyText: string,
  newStatus: AdminSupportTicket['status'] = 'resolved'
): Promise<TicketOperationResult> {
  const sanitizedTicketId = (ticketId || '').trim();
  if (!sanitizedTicketId) {
    throw new Error('شناسه تیکت نامعتبر است.');
  }

  const now = new Date().toISOString();
  const supabase = getSupabase();

  if (supabase) {
    // Determine whether ticketId is UUID format or human-readable ticket_code format
    // to build safe typed parameter queries without dynamic .or() string interpolation injection risks
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sanitizedTicketId);
    
    let query = supabase
      .from('support_tickets')
      .update({
        reply_message: replyText.trim(),
        replied_at: now,
        status: newStatus,
        updated_at: now
      });

    if (isUUID) {
      query = query.eq('id', sanitizedTicketId);
    } else {
      query = query.eq('ticket_code', sanitizedTicketId);
    }

    const { error } = await query;
      
    if (error) {
      console.error('Supabase replyToSupportTicket error:', error);
      throw new Error('عدم دسترسی یا خطای پایگاه داده.');
    }
    return { success: true };
  }

  // Update local vault
  const vault = getLocalTicketsVault();
  const updatedVault = vault.map(t => {
    if (t.id === sanitizedTicketId || (t as any).ticketCode === sanitizedTicketId) {
      return {
        ...t,
        replyMessage: replyText.trim(),
        repliedAt: now,
        status: newStatus,
        updatedAt: now
      };
    }
    return t;
  });

  saveLocalTicketsVault(updatedVault);
  const target = updatedVault.find(t => t.id === sanitizedTicketId);
  return { success: true, ticket: target };
}
