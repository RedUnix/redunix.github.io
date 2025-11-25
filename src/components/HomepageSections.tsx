import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Hash, Terminal, Globe, Image, Sparkles, Search } from 'lucide-react';
import { DraggableSection } from './DraggableSection';
import { GlowBorder } from './GlowBorder';
import { TypeIcon } from './TypeIcon';

interface Post {
  id: string;
  data: {
    title: string;
    date: Date;
    category: string;
    excerpt?: string;
  };
}

interface Resource {
  id: string;
  data: {
    title: string;
    type: string;
  };
}

interface XkcdComic {
  num: number;
  img: string;
  alt: string;
  title: string;
}

interface HomepageSectionsProps {
  posts: Post[];
  quickAccessResources: Resource[];
  xkcdComic: XkcdComic | null;
}

interface SectionLayout {
  left: string[];
  right: string[];
}

interface ApiWidgetSectionProps {
  id: string;
  isDragging: boolean;
  dragOverId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

interface MTGCardData {
  name: string;
  type_line?: string;
  oracle_text?: string;
  mana_cost?: string;
  prices: {
    usd?: string | null;
    usd_foil?: string | null;
    eur?: string | null;
    eur_foil?: string | null;
  };
  image_uris?: {
    normal?: string;
    small?: string;
    large?: string;
  };
  set_name?: string;
  rarity?: string;
  power?: string;
  toughness?: string;
}

const ApiWidgetSection: React.FC<ApiWidgetSectionProps> = ({
  id,
  isDragging,
  dragOverId,
  onDragStart,
  onDragEnd,
}) => {
  const [selectedApi, setSelectedApi] = useState<string>('mtg');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [cardSearch, setCardSearch] = useState<string>('');
  const [cardData, setCardData] = useState<MTGCardData | null>(null);

  const apiOptions = [
    { value: 'mtg', label: 'Magic the Gathering' },
    { value: 'uselessfact', label: 'Useless Fact' },
    { value: 'dogfact', label: 'Dog Fact' },
    { value: 'geekjoke', label: 'Geek Joke' },
  ];

  const fetchMTGCard = useCallback(async (cardName: string) => {
    if (!cardName.trim()) {
      setError('Please enter a card name');
      return;
    }

    setLoading(true);
    setError('');
    setCardData(null);
    setContent('');

    try {
      const encodedName = encodeURIComponent(cardName.trim());
      const url = `https://api.scryfall.com/cards/named?exact=${encodedName}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Card not found. Please check the spelling and try again.');
        } else {
          setError(`Failed to fetch card: ${response.statusText}`);
        }
        return;
      }

      const data: MTGCardData = await response.json();
      setCardData(data);
      
      let infoText = `NAME: ${data.name}\n`;
      if (data.mana_cost) infoText += `MANA_COST: ${data.mana_cost}\n`;
      if (data.type_line) infoText += `TYPE: ${data.type_line}\n`;
      if (data.rarity) infoText += `RARITY: ${data.rarity}\n`;
      if (data.set_name) infoText += `SET: ${data.set_name}\n`;
      if (data.power && data.toughness) {
        infoText += `P/T: ${data.power}/${data.toughness}\n`;
      }
      if (data.oracle_text) {
        infoText += `\nORACLE_TEXT:\n${data.oracle_text}\n`;
      }
      infoText += `\nPRICES:\n`;
      if (data.prices.usd) infoText += `USD: $${data.prices.usd}\n`;
      if (data.prices.usd_foil) infoText += `USD_FOIL: $${data.prices.usd_foil}\n`;
      if (data.prices.eur) infoText += `EUR: €${data.prices.eur}\n`;
      if (data.prices.eur_foil) infoText += `EUR_FOIL: €${data.prices.eur_foil}\n`;
      
      setContent(infoText);
    } catch (err: any) {
      console.error('Error fetching MTG card:', err);
      setError(err.message || 'Failed to fetch card. Please try again.');
      setCardData(null);
      setContent('');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContent = useCallback(async (apiType: string) => {
    if (apiType === 'mtg') {
      return;
    }

    setLoading(true);
    setError('');
    setContent('');
    setCardData(null);

    const fetchWithProxy = async (url: string, useProxy: boolean = false): Promise<Response> => {
      if (useProxy) {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        return fetch(proxyUrl);
      }
      return fetch(url);
    };

    try {
      let url = '';
      let responseData: any;

      switch (apiType) {
        case 'uselessfact':
          url = 'https://uselessfacts.jsph.pl/random.json?language=en';
          try {
            const response = await fetchWithProxy(url);
            if (!response.ok) throw new Error('Direct fetch failed');
            responseData = await response.json();
            setContent(responseData.text || 'No fact available');
          } catch (e) {
            const proxyResponse = await fetchWithProxy(url, true);
            responseData = await proxyResponse.json();
            setContent(responseData.text || 'No fact available');
          }
          break;

        case 'dogfact':
          url = 'https://dogapi.dog/api/v2/facts?limit=1';
          try {
            const response = await fetchWithProxy(url);
            if (!response.ok) throw new Error('Direct fetch failed');
            responseData = await response.json();
            if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
              const fact = responseData.data[0].attributes?.body || responseData.data[0].body;
              setContent(fact || 'No fact available');
            } else {
              setContent('No fact available');
            }
          } catch (e) {
            const proxyResponse = await fetchWithProxy(url, true);
            responseData = await proxyResponse.json();
            if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
              const fact = responseData.data[0].attributes?.body || responseData.data[0].body;
              setContent(fact || 'No fact available');
            } else {
              setContent('No fact available');
            }
          }
          break;

        case 'geekjoke':
          url = 'https://geek-jokes.sameerkumar.website/api?format=json';
          try {
            const response = await fetchWithProxy(url);
            responseData = await response.json();
            setContent(responseData.joke || 'No joke available');
          } catch (e) {
            const proxyResponse = await fetchWithProxy(url, true);
            responseData = await proxyResponse.json();
            setContent(responseData.joke || 'No joke available');
          }
          break;

        default:
          setContent('Select an API to generate content');
      }
    } catch (err: any) {
      console.error('Error fetching API content:', err);
      setError(err.message || 'Failed to fetch content. Please try again.');
      setContent('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedApi && selectedApi !== 'mtg') {
      fetchContent(selectedApi);
    } else if (selectedApi === 'mtg') {
      setContent('');
      setCardData(null);
      setError('');
    }
  }, [selectedApi, fetchContent]);

  const handleMTGSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedApi === 'mtg') {
      fetchMTGCard(cardSearch);
    }
  };

  return (
    <DraggableSection
      id={id}
      title="API_WIDGET"
      icon={<Sparkles size={20} className="text-accent" />}
      isDragging={isDragging}
      dragOverId={dragOverId}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="api-select" className="block text-xs font-mono text-dim mb-2">
            SELECT_API:
          </label>
          <select
            id="api-select"
            value={selectedApi}
            onChange={(e) => {
              setSelectedApi(e.target.value);
              setCardData(null);
              setContent('');
              setError('');
              setCardSearch('');
            }}
            className="w-full p-2 bg-surface border border-dim rounded-sm text-sm font-mono focus:outline-none focus:border-accent transition-colors"
          >
            {apiOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {selectedApi === 'mtg' && (
          <form onSubmit={handleMTGSearch} className="space-y-2">
            <label htmlFor="card-search" className="block text-xs font-mono text-dim mb-2">
              CARD_NAME:
            </label>
            <div className="flex gap-2">
              <input
                id="card-search"
                type="text"
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
                placeholder="e.g., Black Lotus"
                className="flex-1 p-2 bg-surface border border-dim rounded-sm text-sm font-mono focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !cardSearch.trim()}
                className="px-4 py-2 bg-surface border border-dim hover:border-accent text-sm font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search size={16} />
                {loading ? 'SEARCHING...' : 'SEARCH'}
              </button>
            </div>
          </form>
        )}

        <GlowBorder className="p-4 min-h-[100px]">
          {loading && (
            <div className="text-sm text-dim font-mono">Loading...</div>
          )}
          {error && (
            <div className="text-sm text-red-400 font-mono">{error}</div>
          )}
          {!loading && !error && cardData && selectedApi === 'mtg' && (
            <div className="space-y-4">
              {cardData.image_uris?.normal && (
                <div className="mb-3">
                  <img
                    src={cardData.image_uris.normal}
                    alt={cardData.name}
                    className="w-full max-w-[200px] mx-auto rounded-sm border border-dim"
                  />
                </div>
              )}
              <div className="text-sm leading-relaxed text-dim font-mono whitespace-pre-wrap">
                {content}
              </div>
            </div>
          )}
          {!loading && !error && content && selectedApi !== 'mtg' && (
            <div className="text-sm leading-relaxed text-dim font-mono">
              {content}
            </div>
          )}
          {!loading && !error && !content && selectedApi !== 'mtg' && (
            <div className="text-sm text-dim font-mono opacity-50">
              Select an API to generate content
            </div>
          )}
          {!loading && !error && !content && selectedApi === 'mtg' && !cardData && (
            <div className="text-sm text-dim font-mono opacity-50">
              Enter a card name to search
            </div>
          )}
        </GlowBorder>

        {selectedApi !== 'mtg' && (
          <button
            onClick={() => fetchContent(selectedApi)}
            disabled={loading}
            className="w-full px-4 py-2 bg-surface border border-dim hover:border-accent text-sm font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'GENERATING...' : 'GENERATE_NEW'}
          </button>
        )}
      </div>
    </DraggableSection>
  );
};

export const HomepageSections: React.FC<HomepageSectionsProps> = ({
  posts,
  quickAccessResources,
  xkcdComic,
}) => {
  const [layout, setLayout] = useState<SectionLayout>({ left: [], right: [] });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<'left' | 'right' | null>(null);
  
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  const defaultOrder = ['latest-logs', 'system-status', 'quick-access', 'api-widget', 'xkcd'];
  const defaultLeft = ['latest-logs', 'system-status', 'quick-access'];
  const defaultRight = ['api-widget', 'xkcd'];

  // Initialize layout from localStorage
  useEffect(() => {
    const availableSections = defaultOrder.filter(id => id !== 'xkcd' || xkcdComic !== null);
    const savedLayout = localStorage.getItem('homepage-section-layout');
    const oldSavedOrder = localStorage.getItem('homepage-section-order');
    
    let initialLayout: SectionLayout;

    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        const savedLeft = (parsed.left || []).filter((id: string) => availableSections.includes(id));
        const savedRight = (parsed.right || []).filter((id: string) => availableSections.includes(id));
        const allSaved = [...savedLeft, ...savedRight];
        const missingSections = availableSections.filter(id => !allSaved.includes(id));
        
        initialLayout = {
          left: [...savedLeft, ...missingSections],
          right: savedRight,
        };
      } catch (e) {
        console.error('Failed to parse saved layout:', e);
        initialLayout = getDefaultLayout(availableSections);
      }
    } else if (oldSavedOrder) {
      try {
        const parsed = JSON.parse(oldSavedOrder);
        const validOrder = parsed.filter((id: string) => availableSections.includes(id));
        const missingSections = availableSections.filter(id => !validOrder.includes(id));
        const allSections = [...validOrder, ...missingSections];
        
        const midPoint = Math.ceil(allSections.length / 2);
        initialLayout = {
          left: allSections.slice(0, midPoint),
          right: allSections.slice(midPoint),
        };
        
        localStorage.setItem('homepage-section-layout', JSON.stringify(initialLayout));
        localStorage.removeItem('homepage-section-order');
      } catch (e) {
        console.error('Failed to migrate old order:', e);
        initialLayout = getDefaultLayout(availableSections);
      }
    } else {
      initialLayout = getDefaultLayout(availableSections);
    }

    setLayout(initialLayout);
  }, [xkcdComic]);

  function getDefaultLayout(availableSections: string[]): SectionLayout {
    const left = defaultLeft.filter(id => availableSections.includes(id));
    const right = defaultRight.filter(id => availableSections.includes(id));
    const remaining = availableSections.filter(id => !left.includes(id) && !right.includes(id));
    return {
      left: [...left, ...remaining],
      right,
    };
  }

  // Save layout to localStorage whenever it changes
  useEffect(() => {
    if (layout.left.length > 0 || layout.right.length > 0) {
      try {
        localStorage.setItem('homepage-section-layout', JSON.stringify(layout));
      } catch (e) {
        console.error('Failed to save layout:', e);
      }
    }
  }, [layout]);

  const handleDragStart = useCallback((id: string) => {
    setDraggingId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!draggingId) return;

    let newLayout = { ...layout };

    // Find source column
    const sourceColumn = layout.left.includes(draggingId) ? 'left' : 
                        layout.right.includes(draggingId) ? 'right' : null;

    if (!sourceColumn) {
      setDraggingId(null);
      setDragOverId(null);
      setDragOverColumn(null);
      return;
    }

    // Remove from source
    const sourceArray = sourceColumn === 'left' ? [...layout.left] : [...layout.right];
    const sourceIndex = sourceArray.indexOf(draggingId);
    if (sourceIndex === -1) {
      setDraggingId(null);
      setDragOverId(null);
      setDragOverColumn(null);
      return;
    }
    sourceArray.splice(sourceIndex, 1);

    // Determine target column and position
    if (dragOverColumn && dragOverColumn !== sourceColumn) {
      // Moving to different column
      const targetArray = dragOverColumn === 'left' ? [...layout.left] : [...layout.right];
      
      if (dragOverId && targetArray.includes(dragOverId)) {
        // Insert at specific position
        const insertIndex = targetArray.indexOf(dragOverId);
        targetArray.splice(insertIndex, 0, draggingId);
      } else {
        // Append to end
        targetArray.push(draggingId);
      }

      if (dragOverColumn === 'left') {
        newLayout = { left: targetArray, right: sourceArray };
      } else {
        newLayout = { left: sourceArray, right: targetArray };
      }
    } else if (dragOverId && dragOverId !== draggingId && sourceColumn === dragOverColumn) {
      // Reordering within same column
      const targetArray = sourceColumn === 'left' ? [...layout.left] : [...layout.right];
      const dragIndex = targetArray.indexOf(draggingId);
      const overIndex = targetArray.indexOf(dragOverId);
      
      if (dragIndex !== -1 && overIndex !== -1) {
        targetArray.splice(dragIndex, 1);
        const insertIndex = dragIndex < overIndex ? overIndex - 1 : overIndex;
        targetArray.splice(insertIndex, 0, draggingId);
        
        if (sourceColumn === 'left') {
          newLayout = { ...layout, left: targetArray };
        } else {
          newLayout = { ...layout, right: targetArray };
        }
      }
    } else {
      // No valid drop target, revert
      setDraggingId(null);
      setDragOverId(null);
      setDragOverColumn(null);
      return;
    }

    setLayout(newLayout);
    setDraggingId(null);
    setDragOverId(null);
    setDragOverColumn(null);
  }, [draggingId, dragOverId, dragOverColumn, layout]);

  // Determine which column the mouse is over based on position
  const getColumnFromPosition = useCallback((clientX: number): 'left' | 'right' | null => {
    if (!leftColumnRef.current || !rightColumnRef.current) return null;
    
    const leftRect = leftColumnRef.current.getBoundingClientRect();
    const rightRect = rightColumnRef.current.getBoundingClientRect();
    
    // Check if mouse is in left column
    if (clientX >= leftRect.left && clientX <= leftRect.right) {
      return 'left';
    }
    // Check if mouse is in right column
    if (clientX >= rightRect.left && clientX <= rightRect.right) {
      return 'right';
    }
    
    return null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, sectionId: string, column: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (!draggingId || draggingId === sectionId) return;

    // Update drag over state
    setDragOverId(sectionId);
    setDragOverColumn(column);
  }, [draggingId]);

  const handleColumnDragOver = useCallback((e: React.DragEvent, column: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (!draggingId) return;

    // Verify column based on mouse position
    const detectedColumn = getColumnFromPosition(e.clientX);
    if (detectedColumn === column) {
      setDragOverColumn(column);
    }
  }, [draggingId, getColumnFromPosition]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Only clear if actually leaving the element
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverId(null);
    }
  }, []);

  const handleColumnDragLeave = useCallback((e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
      setDragOverId(null);
    }
  }, []);

  // Render section component
  const renderSection = useCallback((id: string) => {
    const isDraggingSection = draggingId === id;
    const isDragOver = dragOverId === id;

    switch (id) {
      case 'latest-logs':
        return (
          <DraggableSection
            key="latest-logs"
            id="latest-logs"
            title="LATEST_LOGS"
            icon={<Hash size={20} className="text-accent" />}
            isDragging={isDraggingSection}
            dragOverId={isDragOver ? dragOverId : null}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-4">
              {posts.map((post) => (
                <a key={post.id} href={`/blog/${post.id}`} className="block">
                  <GlowBorder className="p-4 cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface text-dim">
                        {post.data.category}
                      </span>
                      <span className="text-xs font-mono opacity-50">
                        {post.data.date.toISOString().split('T')[0]}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1 leading-tight group-hover:text-accent transition-colors">
                      {post.data.title}
                    </h3>
                    <p className="text-sm opacity-80 line-clamp-2 text-dim">{post.data.excerpt}</p>
                  </GlowBorder>
                </a>
              ))}
            </div>
          </DraggableSection>
        );

      case 'system-status':
        return (
          <DraggableSection
            key="system-status"
            id="system-status"
            title="SYSTEM_STATUS"
            icon={<Terminal size={20} className="text-success" />}
            isDragging={isDraggingSection}
            dragOverId={isDragOver ? dragOverId : null}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="p-4 rounded-sm font-mono text-sm leading-relaxed bg-surface">
              <p className="mb-4">
                <span className="text-success">guest@terminal-scope:~$</span> Welcome to my digital garden.
                This interface is designed for high-efficiency knowledge retrieval.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-dim">UPTIME:</span>
                  <span>243 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim">KERNEL:</span>
                  <span>5.15.0-76</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim">MEMORY:</span>
                  <span>16GB / 64GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim">LOAD:</span>
                  <span className="text-success">0.12, 0.04</span>
                </div>
              </div>
            </div>
          </DraggableSection>
        );

      case 'quick-access':
        return (
          <DraggableSection
            key="quick-access"
            id="quick-access"
            title="QUICK_ACCESS"
            icon={<Globe size={20} className="text-link" />}
            isDragging={isDraggingSection}
            dragOverId={isDragOver ? dragOverId : null}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-2 gap-3">
              {quickAccessResources.map((res) => (
                <a
                  key={res.id}
                  href={`/resources/${res.id}`}
                  className="flex items-center gap-2 text-sm p-2 border border-transparent hover:border-dim cursor-pointer transition-colors"
                >
                  <TypeIcon type={res.data.type} />
                  <span className="truncate">{res.data.title}</span>
                </a>
              ))}
            </div>
          </DraggableSection>
        );

      case 'api-widget':
        return (
          <ApiWidgetSection
            key="api-widget"
            id="api-widget"
            isDragging={isDraggingSection}
            dragOverId={isDragOver ? dragOverId : null}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        );

      case 'xkcd':
        if (!xkcdComic) return null;
        return (
          <DraggableSection
            key="xkcd"
            id="xkcd"
            title="XKCD"
            icon={<Image size={20} className="text-accent" />}
            isDragging={isDraggingSection}
            dragOverId={isDragOver ? dragOverId : null}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <GlowBorder className="p-4">
              <a
                href={`https://xkcd.com/${xkcdComic.num}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-2"
              >
                <img
                  src={xkcdComic.img}
                  alt={xkcdComic.alt}
                  title={xkcdComic.alt}
                  className="w-full h-auto rounded-sm"
                />
              </a>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-dim">
                  #{xkcdComic.num}: {xkcdComic.title}
                </span>
                <a
                  href={`https://www.explainxkcd.com/wiki/index.php/${xkcdComic.num}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link hover:underline font-mono"
                >
                  explainxkcd →
                </a>
              </div>
            </GlowBorder>
          </DraggableSection>
        );

      default:
        return null;
    }
  }, [posts, quickAccessResources, xkcdComic, draggingId, dragOverId, handleDragStart, handleDragEnd]);

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in" 
      id="homepage-sections"
    >
      {/* Left Column */}
      <div 
        ref={leftColumnRef}
        className="space-y-8"
        onDragOver={(e) => handleColumnDragOver(e, 'left')}
        onDragLeave={handleColumnDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {layout.left.map((id) => (
          <div
            key={id}
            onDragOver={(e) => handleDragOver(e, id, 'left')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {renderSection(id)}
          </div>
        ))}
      </div>

      {/* Right Column */}
      <div 
        ref={rightColumnRef}
        className="space-y-8"
        onDragOver={(e) => handleColumnDragOver(e, 'right')}
        onDragLeave={handleColumnDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {layout.right.map((id) => (
          <div
            key={id}
            onDragOver={(e) => handleDragOver(e, id, 'right')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {renderSection(id)}
          </div>
        ))}
      </div>
    </div>
  );
};
