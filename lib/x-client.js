/**
 * X (Twitter) Data Client using vxtwitter API
 */
export class XClient {
  /**
   * 既存のデータ（Supabase等）から、vxtwitter API を通じてリッチ情報を取得する
   * @param {string} tweetUrlOrId 
   */
  async fetchTweetData(tweetUrlOrId) {
    let tweetId = tweetUrlOrId;
    if (tweetUrlOrId.includes('/')) {
      const parts = tweetUrlOrId.split('/');
      tweetId = parts[parts.length - 1].split('?')[0];
    }

    // vxtwitter API endpoint (通常は handle/status/id だが、IDのみで取得可能な場合もある)
    // ここでは汎用的なパースを想定
    try {
      // 例: https://api.vxtwitter.com/status/123456789
      const response = await fetch(`https://api.vxtwitter.com/i/status/${tweetId}`);
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      return {
        id: tweetId,
        text: data.text || '',
        user: data.user_name || data.user_screen_name || 'Unknown',
        userIcon: data.user_profile_image_url || '',
        media: data.media_urls || [],
        createdAt: data.date || ''
      };
    } catch (error) {
      console.error('vxtwitter fetch error:', error);
      return null;
    }
  }

  /**
   * 複数のツイートデータを並列で取得
   */
  async fetchMultiple(tweetIds) {
    const promises = tweetIds.map(id => this.fetchTweetData(id));
    return (await Promise.all(promises)).filter(item => item !== null);
  }
}
