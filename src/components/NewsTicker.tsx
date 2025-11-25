import { useEffect, useState, useRef } from 'react';
import { useMinimized } from '../utils/useMinimized';

interface Story {
  id: string;
  title: string;
  url: string;
  score: number;
  author: string;
  comments?: number;
}

type NewsSource = 'hn' | 'reddit-news' | 'reddit-worldnews' | 'reddit-uplifting';

interface NewsSourceConfig {
  id: NewsSource;
  label: string;
  url: string;
  limit: number;
}

const NEWS_SOURCES: NewsSourceConfig[] = [
  { id: 'hn', label: 'Hacker News', url: 'https://hn.algolia.com/api/v1/search_by_date?tags=front_page', limit: 10 },
  { id: 'reddit-news', label: 'r/news', url: 'https://www.reddit.com/r/news/hot.json?limit=25', limit: 25 },
  { id: 'reddit-worldnews', label: 'r/worldnews', url: 'https://www.reddit.com/r/worldnews/hot.json?limit=25', limit: 25 },
  { id: 'reddit-uplifting', label: 'r/UpliftingNews', url: 'https://www.reddit.com/r/UpliftingNews/hot.json?limit=20', limit: 20 },
];

export function NewsTicker() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<NewsSource>('hn');
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isMinimized } = useMinimized('news-ticker');

  const fetchHNStories = async (): Promise<Story[]> => {
    const response = await fetch('https://hn.algolia.com/api/v1/search_by_date?tags=front_page');
    const data = await response.json();
    return data.hits.slice(0, 10).map((hit: any) => ({
      id: hit.objectID,
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      score: hit.points,
      author: hit.author,
      comments: hit.num_comments,
    }));
  };

  const fetchRedditStories = async (url: string, limit: number): Promise<Story[]> => {
    try {
      // Try multiple CORS proxy approaches
      const proxies = [
        // Try corsproxy.io first (simpler, direct)
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        // Fallback to allorigins with text handling
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      ];

      let data: any = null;
      let lastError: Error | null = null;

      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl);
          
          if (!response.ok) {
            throw new Error(`CORS proxy error: ${response.status} ${response.statusText}`);
          }
          
          // Handle different proxy response formats
          if (proxyUrl.includes('corsproxy.io')) {
            // corsproxy.io returns the response directly
            data = await response.json();
          } else {
            // allorigins.win wraps it in a 'contents' field
            // Read as text first to avoid Content-Length issues
            const text = await response.text();
            const proxyData = JSON.parse(text);
            
            if (!proxyData.contents) {
              throw new Error('Invalid proxy response structure');
            }
            
            data = JSON.parse(proxyData.contents);
          }
          
          // If we got valid data, break out of the loop
          if (data && data.data && data.data.children) {
            break;
          }
        } catch (error: any) {
          lastError = error;
          // Try next proxy
          continue;
        }
      }
      
      if (!data || !data.data || !data.data.children) {
        throw lastError || new Error('Failed to fetch from all CORS proxies');
      }
      
      return data.data.children.slice(0, limit).map((child: any) => {
        // Reddit posts can link to external URLs or be self-posts
        // If it's a self-post or relative URL, use the Reddit permalink
        const postUrl = child.data.url && child.data.url.startsWith('http') 
          ? child.data.url 
          : `https://reddit.com${child.data.permalink}`;
        
        return {
          id: child.data.id,
          title: child.data.title,
          url: postUrl,
          score: child.data.score,
          author: child.data.author,
          comments: child.data.num_comments,
        };
      });
    } catch (error) {
      console.error('Error fetching Reddit stories:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      setError(null);
      try {
        const source = NEWS_SOURCES.find(s => s.id === selectedSource);
        if (!source) {
          setError('Source not found');
          setLoading(false);
          return;
        }

        let fetchedStories: Story[];
        if (selectedSource === 'hn') {
          fetchedStories = await fetchHNStories();
        } else {
          fetchedStories = await fetchRedditStories(source.url, source.limit);
        }
        
        setStories(fetchedStories);
        setLoading(false);
      } catch (error: any) {
        console.error(`Failed to fetch stories from ${selectedSource}:`, error);
        const errorMessage = error?.message || 'Failed to load stories';
        setError(errorMessage);
        setStories([]);
        setLoading(false);
      }
    };

    fetchStories();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStories, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedSource]);

  // Calculate menu position when opening
  useEffect(() => {
    if (menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.top - 1, // Position above the button
        left: rect.left,
      });
    }
  }, [menuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  // When minimized, don't render anything
  if (isMinimized) {
    return null;
  }

  if (loading) {
    return (
      <div className="relative bg-surface border-t border-dim h-10 flex items-center px-4">
        <span className="text-xs font-mono text-dim">Loading news...</span>
      </div>
    );
  }

  if (stories.length === 0 && !loading) {
    return (
      <div className="relative bg-surface border-t border-dim h-10 flex items-center px-4">
        <span className="text-xs font-mono text-dim">
          {error ? `Error: ${error}` : 'No news available'}
        </span>
      </div>
    );
  }

  const currentSource = NEWS_SOURCES.find(s => s.id === selectedSource);

  return (
    <div className="relative bg-surface border-t border-dim h-10 overflow-hidden">
      <div className="flex items-center h-full">
        <div className="flex-shrink-0 relative">
          <button
            ref={buttonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className="px-4 h-full bg-surface border-r border-dim hover:bg-bg transition-colors cursor-pointer"
          >
            <span className="text-xs font-mono text-accent font-bold">
              {currentSource?.label || 'News'}:
            </span>
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              className="fixed bg-surface border border-dim shadow-lg z-[9999] min-w-[180px]"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                transform: 'translateY(calc(-100% - 4px))',
              }}
            >
              {NEWS_SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => {
                    setSelectedSource(source.id);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-mono hover:bg-bg transition-colors ${
                    selectedSource === source.id
                      ? 'text-accent bg-bg'
                      : 'text-dim'
                  }`}
                >
                  {source.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex news-ticker-scroll whitespace-nowrap">
            {stories.map((story) => (
              <div key={story.id} className="flex items-center mx-8">
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-dim hover:text-accent transition-colors flex items-center gap-2"
                >
                  <span className="text-success">[{story.score}]</span>
                  <span className="truncate max-w-md">{story.title}</span>
                  <span className="text-dim opacity-50">•</span>
                  <span className="text-dim opacity-70">{story.author}</span>
                </a>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {stories.map((story) => (
              <div key={`duplicate-${story.id}`} className="flex items-center mx-8">
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-dim hover:text-accent transition-colors flex items-center gap-2"
                >
                  <span className="text-success">[{story.score}]</span>
                  <span className="truncate max-w-md">{story.title}</span>
                  <span className="text-dim opacity-50">•</span>
                  <span className="text-dim opacity-70">{story.author}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

