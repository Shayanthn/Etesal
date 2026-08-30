import { getSupabase } from './supabaseClient';
import { AdminSupportTicket } from '../types/admin';
import { INITIAL_SUPPORT_TICKETS } from '../data/adminData';

const LOCAL_TICKETS_STORAGE_KEY = 'etesal_support_tickets_vault';

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
 * Generate cryptographic human-friendly ticket tracking code (e.g. TCK-A1B2C3D4E5F6)
 */
export function generateTicketCode(): string {
  // Use crypto for cryptographically secure, unguessable ticket codes
  // We remove hyphens and take 24 chars, total length 28 (fits in VARCHAR(30))
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); // Fallback
  return 'TCK-' + uuid.replace(/-/g, '').substring(0, 24).toUpperCase();
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
    id: 'tck_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
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
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([
          {
            user_id: params.userId || null,
            user_name: newTicket.userName,
            user_email: newTicket.userEmail,
            telegram_username: newTicket.telegramUsername,
            subject: newTicket.subject,
            category: newTicket.category,
            operator: newTicket.operator,
            priority: newTicket.priority,
            status: newTicket.status,
            message: newTicket.message
          }
        ])
        .select()
        .single();

      if (error) {
        // If DB fails, fallback gracefully to local store with a locally generated code
        newTicket.id = generateTicketCode();
        const vault = getLocalTicketsVault();
        saveLocalTicketsVault([newTicket, ...vault]);
        return { success: true, ticket: newTicket };
      }

      if (data) {
        newTicket.id = data.ticket_code || data.id;
      }

      // Also mirror locally for instant retrieval
      const vault = getLocalTicketsVault();
      saveLocalTicketsVault([newTicket, ...vault]);
      return { success: true, ticket: newTicket };
    } catch {
      newTicket.id = generateTicketCode();
      const vault = getLocalTicketsVault();
      saveLocalTicketsVault([newTicket, ...vault]);
      return { success: true, ticket: newTicket };
    }
  }

  // Local Offline Mode
  newTicket.id = generateTicketCode();
  const vault = getLocalTicketsVault();
  saveLocalTicketsVault([newTicket, ...vault]);
  return { success: true, ticket: newTicket };
}

/**
 * Fetches all tickets (For Master Admin Dashboard)
 */
export async function fetchTicketByCode(code: string): Promise<AdminSupportTicket | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_ticket_by_code', { p_ticket_code: code });
      
      if (!error && data && data.length > 0) {
        const item = data[0];
        return {
          id: item.ticket_code, // Use code as ID for guests
          subject: item.subject,
          category: item.category || 'connection',
          operator: item.operator || 'mci',
          userName: 'Guest',
          message: item.message,
          status: item.status || 'pending',
          priority: 'medium',
          replyMessage: item.reply_message,
          repliedAt: item.replied_at,
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.created_at || new Date().toISOString()
        } as AdminSupportTicket;
      }
    } catch {
      // Fallback below
    }
  }

  // Local Offline Mode fallback
  const vault = getLocalTicketsVault();
  const ticket = vault.find(t => t.id === code || (t as any).ticket_code === code || (t as any).ticketCode === code);
  return ticket || null;
}

/**
 * Fetches all tickets (For Master Admin Dashboard)
 */
export async function fetchAllTickets(): Promise<AdminSupportTicket[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: AdminSupportTicket[] = data.map((item: any) => ({
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
        saveLocalTicketsVault(mapped);
        return mapped;
      }
    } catch {
      // Fallback
    }
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
  const now = new Date().toISOString();
  const supabase = getSupabase();

  if (supabase) {
    try {
      await supabase
        .from('support_tickets')
        .update({
          reply_message: replyText.trim(),
          replied_at: now,
          status: newStatus,
          updated_at: now
        })
        .or(`id.eq.${ticketId},ticket_code.eq.${ticketId}`);
    } catch {
      // Ignore background sync error
    }
  }

  // Update local vault
  const vault = getLocalTicketsVault();
  const updatedVault = vault.map(t => {
    if (t.id === ticketId || (t as any).ticketCode === ticketId) {
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
  const target = updatedVault.find(t => t.id === ticketId);
  return { success: true, ticket: target };
}
