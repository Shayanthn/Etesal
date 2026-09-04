import { getSupabase } from './supabaseClient';
import { V2RayConfig, MtprotoProxy } from '../types';
import { SAMPLE_CONFIGS } from '../data/configs.data';
import { SAMPLE_PROXIES } from '../data/proxies.data';

const LOCAL_CONFIGS_KEY = 'etesal_configs_vault';
const LOCAL_PROXIES_KEY = 'etesal_proxies_vault';

/**
 * Loads active configs from Supabase or fallback vault
 */
export async function fetchLiveConfigs(): Promise<V2RayConfig[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('configs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        protocol: item.protocol,
        configString: item.config_string,
        operator: item.operator || 'all',
        ping: item.ping || 45,
        location: item.location || 'سرور بین‌المللی اختصاصی',
        flag: item.flag || '⚡',
        quality: item.quality || 'excellent',
        tlsType: item.protocol === 'hysteria2' ? 'quic/tls' : 'reality',
        transport: item.protocol === 'hysteria2' ? 'udp' : 'tcp',
        verifiedAt: 'لحظاتی پیش',
        isOfficial: item.is_official ?? true
      }));
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_CONFIGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore
  }
  return SAMPLE_CONFIGS;
}

/**
 * Loads active MTProto proxies from Supabase or fallback vault
 */
export async function fetchLiveProxies(): Promise<MtprotoProxy[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('proxies')
      .select('*')
      .eq('is_active', true)
      .order('ping', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        host: item.host,
        port: item.port,
        secret: item.secret,
        ping: item.ping || 35,
        location: item.location || 'سرور بین‌المللی اختصاصی',
        flag: item.flag || '⚡',
        verifiedAt: 'لحظاتی پیش',
        isVip: false
      }));
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_PROXIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore
  }

  return SAMPLE_PROXIES;
}

/**
 * Saves a newly ingested batch of configs to Supabase & local cache
 */
export async function saveConfigsBatch(configs: V2RayConfig[]): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    const dbPayload = configs.map(c => ({
      name: c.name,
      protocol: c.protocol,
      config_string: c.configString,
      operator: c.operator,
      ping: c.ping,
      location: c.location,
      flag: c.flag,
      quality: c.quality,
      is_official: c.isOfficial ?? true,
      is_active: true
    }));
    
    const { error } = await supabase.from('configs').upsert(dbPayload, { onConflict: 'config_string' });
    
    if (error) {
      console.error("Supabase saveConfigsBatch error:", error);
      throw new Error('خطا در ذخیره‌سازی: عدم دسترسی کافی یا مشکل ارتباط با پایگاه داده.');
    }
    
    return true; // Stop here, do not save to local storage if DB is active
  }

  try {
    localStorage.setItem(LOCAL_CONFIGS_KEY, JSON.stringify(configs));
  } catch {
    // Ignore
  }

  return true;
}
