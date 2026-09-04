/**
 * Country & Flag Utility for Etesal Hub
 * Formats location and country names cleanly in Persian with proper flag emojis
 */

export interface CountryInfo {
  code: string;
  nameFa: string;
  flag: string;
}

const COUNTRY_MAP: Record<string, { nameFa: string; flag: string }> = {
  de: { nameFa: 'آلمان', flag: '🇩🇪' },
  germany: { nameFa: 'آلمان', flag: '🇩🇪' },
  frankfurt: { nameFa: 'آلمان (فرانکفورت)', flag: '🇩🇪' },
  berlin: { nameFa: 'آلمان (برلین)', flag: '🇩🇪' },

  nl: { nameFa: 'هلند', flag: '🇳🇱' },
  netherlands: { nameFa: 'هلند', flag: '🇳🇱' },
  amsterdam: { nameFa: 'هلند (آمستردام)', flag: '🇳🇱' },

  fi: { nameFa: 'فنلاند', flag: '🇫🇮' },
  finland: { nameFa: 'فنلاند', flag: '🇫🇮' },
  helsinki: { nameFa: 'فنلاند (هلسینکی)', flag: '🇫🇮' },

  fr: { nameFa: 'فرانسه', flag: '🇫🇷' },
  france: { nameFa: 'فرانسه', flag: '🇫🇷' },
  paris: { nameFa: 'فرانسه (پاریس)', flag: '🇫🇷' },

  gb: { nameFa: 'انگلستان', flag: '🇬🇧' },
  uk: { nameFa: 'انگلستان', flag: '🇬🇧' },
  london: { nameFa: 'انگلستان (لندن)', flag: '🇬🇧' },

  tr: { nameFa: 'ترکیه', flag: '🇹🇷' },
  turkey: { nameFa: 'ترکیه', flag: '🇹🇷' },
  istanbul: { nameFa: 'ترکیه (استانبول)', flag: '🇹🇷' },

  us: { nameFa: 'آمریکا', flag: '🇺🇸' },
  usa: { nameFa: 'ایالات متحده آمریکا', flag: '🇺🇸' },
  unitedstates: { nameFa: 'آمریکا', flag: '🇺🇸' },

  se: { nameFa: 'سوئد', flag: '🇸🇪' },
  sweden: { nameFa: 'سوئد', flag: '🇸🇪' },
  stockholm: { nameFa: 'سوئد (استکهلم)', flag: '🇸🇪' },

  ch: { nameFa: 'سوئیس', flag: '🇨🇭' },
  switzerland: { nameFa: 'سوئیس', flag: '🇨🇭' },
  zurich: { nameFa: 'سوئیس (زوریخ)', flag: '🇨🇭' },

  at: { nameFa: 'اتریش', flag: '🇦🇹' },
  austria: { nameFa: 'اتریش', flag: '🇦🇹' },
  vienna: { nameFa: 'اتریش (وین)', flag: '🇦🇹' },

  ca: { nameFa: 'کانادا', flag: '🇨🇦' },
  canada: { nameFa: 'کانادا', flag: '🇨🇦' },

  sg: { nameFa: 'سنگاپور', flag: '🇸🇬' },
  singapore: { nameFa: 'سنگاپور', flag: '🇸🇬' },

  jp: { nameFa: 'ژاپن', flag: '🇯🇵' },
  japan: { nameFa: 'ژاپن', flag: '🇯🇵' },
  tokyo: { nameFa: 'ژاپن (توکیو)', flag: '🇯🇵' },

  pl: { nameFa: 'لهستان', flag: '🇵🇱' },
  poland: { nameFa: 'لهستان', flag: '🇵🇱' },
  warsaw: { nameFa: 'لهستان (ورشو)', flag: '🇵🇱' },

  it: { nameFa: 'ایتالیا', flag: '🇮🇹' },
  italy: { nameFa: 'ایتالیا', flag: '🇮🇹' },
  milan: { nameFa: 'ایتالیا (میلان)', flag: '🇮🇹' },
  rome: { nameFa: 'ایتالیا (رم)', flag: '🇮🇹' },
};

/**
 * Extracts clean country name and flag emoji from location or name
 */
export function getCountryDisplay(
  location?: string,
  name?: string,
  rawFlag?: string
): CountryInfo {
  // If flag emoji is already valid national flag (e.g. 🇩🇪, 🇳🇱)
  const isEmojiFlag = rawFlag && rawFlag.length >= 2 && rawFlag !== '⚡' && rawFlag !== '🌐' && rawFlag !== '🔵' && rawFlag !== '🟡';

  const textToSearch = `${location || ''} ${name || ''} ${rawFlag || ''}`.toLowerCase();

  // Search through known countries
  for (const [key, val] of Object.entries(COUNTRY_MAP)) {
    if (textToSearch.includes(key)) {
      return {
        code: key.toUpperCase(),
        nameFa: val.nameFa,
        flag: isEmojiFlag ? rawFlag! : val.flag,
      };
    }
  }

  // Persian keywords check
  if (textToSearch.includes('آلمان') || textToSearch.includes('فرانکفورت')) {
    return { code: 'DE', nameFa: 'آلمان (فرانکفورت)', flag: '🇩🇪' };
  }
  if (textToSearch.includes('هلند') || textToSearch.includes('آمستردام')) {
    return { code: 'NL', nameFa: 'هلند (آمستردام)', flag: '🇳🇱' };
  }
  if (textToSearch.includes('فنلاند') || textToSearch.includes('هلسینکی')) {
    return { code: 'FI', nameFa: 'فنلاند (هلسینکی)', flag: '🇫🇮' };
  }
  if (textToSearch.includes('فرانسه') || textToSearch.includes('پاریس')) {
    return { code: 'FR', nameFa: 'فرانسه (پاریس)', flag: '🇫🇷' };
  }
  if (textToSearch.includes('انگلیس') || textToSearch.includes('لندن') || textToSearch.includes('بریتانیا')) {
    return { code: 'GB', nameFa: 'انگلستان (لندن)', flag: '🇬🇧' };
  }
  if (textToSearch.includes('ترکیه') || textToSearch.includes('استانبول')) {
    return { code: 'TR', nameFa: 'ترکیه (استانبول)', flag: '🇹🇷' };
  }
  if (textToSearch.includes('آمریکا') || textToSearch.includes('ایالات متحده')) {
    return { code: 'US', nameFa: 'آمریکا (نیویورک)', flag: '🇺🇸' };
  }
  if (textToSearch.includes('سوئد') || textToSearch.includes('استکهلم')) {
    return { code: 'SE', nameFa: 'سوئد (استکهلم)', flag: '🇸🇪' };
  }
  if (textToSearch.includes('سوئیس') || textToSearch.includes('زوریخ')) {
    return { code: 'CH', nameFa: 'سوئیس (زوریخ)', flag: '🇨🇭' };
  }
  if (textToSearch.includes('اتریش') || textToSearch.includes('وین')) {
    return { code: 'AT', nameFa: 'اتریش (وین)', flag: '🇦🇹' };
  }

  // Default fallback to global dedicated edge server
  return {
    code: 'GLOBAL',
    nameFa: location && location !== '⚡' ? location : 'سرور بین‌المللی اختصاصی',
    flag: isEmojiFlag ? rawFlag! : '🌐',
  };
}
