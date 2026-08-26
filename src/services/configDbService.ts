import { getSupabase } from './supabaseClient';
import { V2RayConfig, MtprotoProxy } from '../types';
import { SAMPLE_CONFIGS, SAMPLE_PROXIES } from '../data';

const LOCAL_CONFIGS_KEY = 'etesal_configs_vault';
const LOCAL_PROXIES_KEY = 'etesal_proxies_vault';

/**
 * Loads active configs from Supabase or fallback vault
 */
export async function fetchLiveConfigs(): Promise<V2RayConfig[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
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
          location: item.location || '🇩🇪 آلمان - Frankfurt',
          flag: item.flag || '🇩🇪',
          quality: item.quality || 'excellent',
          tlsType: item.protocol === 'hysteria2' ? 'quic/tls' : 'reality',
          transport: item.protocol === 'hysteria2' ? 'udp' : 'tcp',
          verifiedAt: 'لحظاتی پیش',
          isOfficial: item.is_official ?? true
        }));
      }
    } catch {
      // Fallback
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_CONFIGS_KEY);
    if (raw) return JSON.parse(raw);
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
    try {
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
          location: item.location || '🇩🇪 فرانکفورت - آلمان',
          flag: item.flag || '🇩🇪',
          verifiedAt: 'لحظاتی پیش',
          isVip: false
        }));
      }
    } catch {
      // Fallback
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_PROXIES_KEY);
    if (raw) return JSON.parse(raw);
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
    try {
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

      await supabase.from('configs').upsert(dbPayload, { onConflict: 'config_string' });
    } catch {
      // Fallback
    }
  }

  try {
    localStorage.setItem(LOCAL_CONFIGS_KEY, JSON.stringify(configs));
  } catch {
    // Ignore
  }

  return true;
}
