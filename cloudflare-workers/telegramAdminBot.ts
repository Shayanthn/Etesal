import { 
  formatMediaPostCaption, 
  formatSingleConfigPost, 
  formatTopConfigsBatchPosts,
  TelegramMediaType,
  TelegramMediaQueueItem,
  TelegramProxyItem,
  TelegramConfigItem
} from '../utils/telegramPublisherEngine';

// صف رسانه‌ها در لایه کلاینت/سرور
let inMemoryMediaQueue: TelegramMediaQueueItem[] = [];

export interface TelegramAdminWebhookPayload {
  message?: {
    chat?: { id: number | string };
    from?: { id: number | string };
    text?: string;
    caption?: string;
    photo?: Array<{ file_id: string }>;
    audio?: { file_id: string; title?: string; performer?: string };
    voice?: { file_id: string };
    video?: { file_id: string };
    animation?: { file_id: string };
  };
}

/**
 * پردازش پیام ورودی ربات ادمین تلگرام و تفکیک هوشمند نوع رسانه
 */
export function handleTelegramAdminMessage(update: TelegramAdminWebhookPayload) {
  if (!update || !update.message) {
    return { ok: false, error: 'Invalid payload' };
  }

  const message = update.message;
  let mediaType: TelegramMediaType = 'text';
  let fileId: string | undefined;
  let caption = message.caption || message.text || '';
  let title = '';

  if (message.audio || message.voice) {
    mediaType = 'audio';
    const audioObj = message.audio || message.voice;
    fileId = audioObj?.file_id;
    title = message.audio?.title || message.audio?.performer || 'موزیک اختصاصی اتصال';
  } else if (message.video || message.animation) {
    mediaType = 'video';
    fileId = (message.video || message.animation)?.file_id;
    title = 'ویدیو کلیپ اختصاصی';
  } else if (message.photo && message.photo.length > 0) {
    mediaType = 'photo';
    const bestPhoto = message.photo[message.photo.length - 1];
    fileId = bestPhoto.file_id;
  } else if (message.text) {
    mediaType = 'text';
    caption = message.text;
  }

  const newItem: TelegramMediaQueueItem = {
    id: `mq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    mediaType,
    fileId,
    caption,
    title,
    status: 'pending',
    attachedProxies: [],
    createdAt: new Date().toISOString()
  };

  inMemoryMediaQueue.push(newItem);

  return {
    ok: true,
    mediaType,
    id: newItem.id,
    item: newItem,
    isAudioImmediate: mediaType === 'audio'
  };
}

export function getMediaQueue() {
  return inMemoryMediaQueue;
}

export function dispatchConfigsAction(configs: TelegramConfigItem[], maxCount: number = 3) {
  return formatTopConfigsBatchPosts(configs, maxCount);
}

export function dispatchNextMediaAction(activeProxies: TelegramProxyItem[] = []) {
  const pendingItem = inMemoryMediaQueue.find(i => i.status === 'pending');
  if (!pendingItem) {
    return { ok: false, reason: 'صف رسانه‌ها خالی است' };
  }

  const formatted = formatMediaPostCaption(
    pendingItem.mediaType,
    pendingItem.caption,
    activeProxies,
    true
  );

  if (!formatted.canPublish) {
    return {
      ok: false,
      reason: formatted.reason,
      item: pendingItem
    };
  }

  pendingItem.status = 'published';
  pendingItem.publishedAt = new Date().toISOString();
  pendingItem.purgeAfter = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return {
    ok: true,
    item: pendingItem,
    formattedCaption: formatted.formattedCaption
  };
}
