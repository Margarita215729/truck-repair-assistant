// YouTube API service for educational content
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  channelTitle: string;
  viewCount: number;
  url: string;
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  nextPageToken?: string;
  totalResults: number;
}

export class YouTubeService {
  private readonly apiKey = process.env.YOUTUBE_API_KEY;
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    if (!this.apiKey) {
      console.warn('YouTube API key not found. Video features will be limited.');
    }
  }

  async searchRepairVideos(query: string, maxResults: number = 10): Promise<YouTubeSearchResult> {
    if (!this.apiKey) {
      return this.getFallbackVideos(query);
    }

    try {
      // Search for videos
      const searchResponse = await fetch(
        `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(query + ' truck repair')}&type=video&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!searchResponse.ok) {
        throw new Error(`YouTube API error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

      // Get video details
      const detailsResponse = await fetch(
        `${this.baseUrl}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${this.apiKey}`
      );

      if (!detailsResponse.ok) {
        throw new Error(`YouTube API error: ${detailsResponse.status}`);
      }

      const detailsData = await detailsResponse.json();

      const videos: YouTubeVideo[] = detailsData.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        duration: this.formatDuration(item.contentDetails.duration),
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        viewCount: parseInt(item.statistics.viewCount || '0'),
        url: `https://www.youtube.com/watch?v=${item.id}`,
      }));

      return {
        videos,
        nextPageToken: searchData.nextPageToken,
        totalResults: searchData.pageInfo.totalResults,
      };
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      return this.getFallbackVideos(query);
    }
  }

  async getMaintenanceVideos(): Promise<YouTubeVideo[]> {
    const queries = [
      'truck oil change maintenance',
      'truck brake inspection',
      'truck engine diagnostics',
      'truck transmission service',
    ];

    const allVideos: YouTubeVideo[] = [];

    for (const query of queries) {
      const result = await this.searchRepairVideos(query, 3);
      allVideos.push(...result.videos);
    }

    // Remove duplicates and sort by view count
    const uniqueVideos = allVideos.filter(
      (video, index, self) => index === self.findIndex(v => v.id === video.id)
    );

    return uniqueVideos.sort((a, b) => b.viewCount - a.viewCount).slice(0, 12);
  }

  async getPopularChannels(): Promise<string[]> {
    // Return popular truck repair YouTube channels
    return [
      'AdeptApe',
      'PowerNation',
      'ChrisFix',
      'Scotty Kilmer',
      'Big Truck Big RV',
      'Truck Trend Network',
      'Heavy Duty Trucking',
      'Diesel Power Magazine',
    ];
  }

  private formatDuration(duration: string): string {
    // Convert ISO 8601 duration (PT4M13S) to readable format (4:13)
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private getFallbackVideos(query: string): YouTubeSearchResult {
    // Fallback videos when API is not available
    const fallbackVideos: YouTubeVideo[] = [
      {
        id: 'fallback1',
        title: `How to Fix ${query} - Professional Guide`,
        description: 'Step-by-step guide for truck repair',
        thumbnail: '/images/video-placeholder.jpg',
        duration: '10:30',
        publishedAt: new Date().toISOString(),
        channelTitle: 'Truck Repair Pro',
        viewCount: 15000,
        url: '#',
      },
      {
        id: 'fallback2',
        title: `${query} Troubleshooting Tips`,
        description: 'Common issues and solutions',
        thumbnail: '/images/video-placeholder.jpg',
        duration: '8:15',
        publishedAt: new Date().toISOString(),
        channelTitle: 'Heavy Duty Repair',
        viewCount: 12000,
        url: '#',
      },
    ];

    return {
      videos: fallbackVideos,
      totalResults: fallbackVideos.length,
    };
  }
}

// Singleton instance
export const youtubeService = new YouTubeService();
