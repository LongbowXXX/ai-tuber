import axios from 'axios';

const VOICEVOX_API_BASE = import.meta.env.VITE_VOICEVOX_API_BASE;

export async function playVoice(characterId: string, text: string): Promise<void> {
  // avatar1 の場合は 3
  // avatar2 の場合は 2
  const speakerId = characterId === 'avatar1' ? 3 : 2;
  try {
    await playVoiceVoxTTS(text, speakerId);
  } catch (error) {
    console.error('Error playing voice:', error);
  }
}

/**
 * VOICEVOX WebAPI を使ってテキストを音声合成し、再生する関数
 * @param text 合成するテキスト
 * @param speakerId VOICEVOXの話者ID
 */
export async function playVoiceVoxTTS(text: string, speakerId: number): Promise<void> {
  if (!VOICEVOX_API_BASE) {
    // 環境変数が未設定の場合は8秒待つダミー挙動
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
  await audio.play();
  // 再生終了後にURLを解放
  audio.onended = () => URL.revokeObjectURL(audioUrl);
}
