import axios from 'axios';

const VOICEVOX_API_BASE = import.meta.env.VITE_VOICEVOX_API_BASE;
const TTS_ENABLED = import.meta.env.VITE_TTS_ENABLED !== 'false'; // デフォルト有効、'false'で無効

export async function playVoice(characterId: string, text: string, onPlay?: () => void): Promise<void> {
  // avatar1 の場合は 3
  // avatar2 の場合は 2
  const speakerId = characterId === 'avatar1' ? 3 : 2;
  try {
    await playVoiceVoxTTS(text, speakerId, onPlay);
  } catch (error) {
    console.error('Error playing voice:', error);
  }
}

/**
 * VOICEVOX WebAPI を使ってテキストを音声合成し、再生する関数
 * @param text 合成するテキスト
 * @param speakerId VOICEVOXの話者ID
 * @param onPlay 音声再生直前に呼ばれるコールバック
 */
export async function playVoiceVoxTTS(text: string, speakerId: number, onPlay?: () => void): Promise<void> {
  if (!TTS_ENABLED) {
    // TTS無効時は8秒待つダミー挙動
    if (onPlay) onPlay();
    await new Promise(resolve => setTimeout(resolve, 8000));
    return;
  }
  if (!VOICEVOX_API_BASE) {
    // 環境変数が未設定の場合も8秒待つダミー挙動
    if (onPlay) onPlay();
    await new Promise(resolve => setTimeout(resolve, 8000));
    return;
  }

  // 1. クエリ作成
  const queryRes = await axios.post(`${VOICEVOX_API_BASE}/audio_query`, null, {
    params: { text, speaker: speakerId },
  });
  const audioQuery = queryRes.data;

  // 2. 音声合成
  const synthRes = await axios.post(`${VOICEVOX_API_BASE}/synthesis`, audioQuery, {
    params: { speaker: speakerId },
    responseType: 'arraybuffer',
    headers: { 'Content-Type': 'application/json' },
  });
  const audioData = synthRes.data;

  // 3. 再生
  const audioBlob = new Blob([audioData], { type: 'audio/wav' });
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  try {
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = e => {
        URL.revokeObjectURL(audioUrl);
        reject(e);
      };
      if (onPlay) onPlay(); // 再生直前にコールバック
      audio.play();
    });
  } catch (e) {
    // エラー時もURLを解放
    URL.revokeObjectURL(audioUrl);
    throw e;
  }
}
