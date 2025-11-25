import { useEffect, useMemo, useState } from 'react';
import type { Playlist, MediaPlayEventDetail } from '../types/media';

type Props = {
  playlists: Playlist[];
};

const formatDate = (dateString: string) => {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.valueOf())) return '';
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export function MediaPlayer({ playlists }: Props) {
  if (!playlists.length) {
    return (
      <div className="border border-dashed border-surface rounded-sm p-6 text-sm text-dim">
        Add at least one channel in `playlist.md` to unlock the media player.
      </div>
    );
  }

  const fallbackPlaylist = playlists.find((playlist) => playlist.videos.length > 0) ?? playlists[0];
  const fallbackPlaylistId = fallbackPlaylist?.id ?? '';
  const fallbackVideoId = fallbackPlaylist?.videos[0]?.videoId ?? '';

  const [activePlaylistId, setActivePlaylistId] = useState(fallbackPlaylistId);
  const [activeVideoId, setActiveVideoId] = useState(fallbackVideoId);

  useEffect(() => {
    if (!activePlaylistId && fallbackPlaylistId) {
      setActivePlaylistId(fallbackPlaylistId);
    }
  }, [activePlaylistId, fallbackPlaylistId]);

  useEffect(() => {
    const playlist = playlists.find((entry) => entry.id === activePlaylistId);
    if (!playlist) return;
    const containsVideo = playlist.videos.some((video) => video.videoId === activeVideoId);
    if (!containsVideo) {
      setActiveVideoId(playlist.videos[0]?.videoId ?? '');
    }
  }, [activePlaylistId, playlists, activeVideoId]);

  const activePlaylist =
    useMemo(() => playlists.find((playlist) => playlist.id === activePlaylistId), [activePlaylistId, playlists]) ??
    fallbackPlaylist;

  const activeVideo =
    useMemo(() => activePlaylist?.videos.find((video) => video.videoId === activeVideoId), [activePlaylist, activeVideoId]) ??
    activePlaylist?.videos[0];

  const embedUrl = activeVideo?.videoId
    ? `https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?rel=0&modestbranding=1`
    : null;

  const handleSelectPlaylist = (playlistId: string, preferredVideoId?: string) => {
    if (playlistId === activePlaylistId) return;
    const playlist = playlists.find((entry) => entry.id === playlistId);
    setActivePlaylistId(playlistId);
    if (preferredVideoId) {
      setActiveVideoId(preferredVideoId);
    } else if (playlist?.videos[0]?.videoId) {
      setActiveVideoId(playlist.videos[0].videoId);
    }
  };

  const handleSelectVideo = (playlistId: string, videoId?: string) => {
    if (!videoId) return;
    if (playlistId !== activePlaylistId) {
      setActivePlaylistId(playlistId);
    }
    setActiveVideoId(videoId);
  };

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<MediaPlayEventDetail>;
      const detail = customEvent.detail;
      if (!detail?.playlistId) return;
      const exists = playlists.some((playlist) => playlist.id === detail.playlistId);
      if (!exists) return;
      setActivePlaylistId(detail.playlistId);
      if (detail.videoId) {
        setActiveVideoId(detail.videoId);
      } else {
        const playlist = playlists.find((entry) => entry.id === detail.playlistId);
        if (playlist?.videos[0]?.videoId) {
          setActiveVideoId(playlist.videos[0].videoId);
        }
      }
    };

    window.addEventListener('media-player:play', handler as EventListener);
    return () => window.removeEventListener('media-player:play', handler as EventListener);
  }, [playlists]);

  const emptyState = (
    <div className="border border-dashed border-surface rounded-sm p-6 text-center text-sm text-dim">
      Waiting for new uploads. Try refreshing the feed in a bit.
    </div>
  );

  if (!activePlaylist || activePlaylist.videos.length === 0) {
    return emptyState;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              className={[
                'px-3 py-1 rounded-sm border text-xs font-semibold transition-colors',
                playlist.id === activePlaylistId ? 'bg-accent text-bg border-accent' : 'border-surface hover:border-accent',
              ].join(' ')}
              onClick={() => handleSelectPlaylist(playlist.id)}
              type="button"
            >
              {playlist.title}
            </button>
          ))}
        </div>
        <p className="text-xs text-dim">
          {activePlaylist?.note ?? 'Latest uploads from the selected channel.'}
        </p>
      </div>

      <div className="border border-surface rounded-sm overflow-hidden bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={activeVideo?.title ?? 'Media player'}
            className="w-full h-[320px] md:h-[420px]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="h-[320px] md:h-[420px] flex items-center justify-center text-sm text-dim">
            Select a video to start playback.
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_1fr]">
        <div className="border border-surface rounded-sm p-3">
          <h3 className="text-xs font-semibold text-dim mb-2 uppercase tracking-wide">
            {activePlaylist?.title} queue
          </h3>
          <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
            {activePlaylist?.videos.map((video) => (
              <button
                key={`${activePlaylist.id}-${video.videoId ?? video.link}`}
                className={[
                  'w-full text-left border rounded-sm p-2 transition-colors',
                  video.videoId === activeVideoId ? 'border-accent bg-accent/10' : 'border-surface hover:border-accent',
                ].join(' ')}
                onClick={() => handleSelectVideo(activePlaylist.id, video.videoId)}
                type="button"
              >
                <p className="text-sm font-semibold line-clamp-2">{video.title}</p>
                <p className="text-[11px] text-dim">
                  {formatDate(video.published)}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="border border-surface rounded-sm p-3 space-y-3">
          <div>
            <h3 className="text-xs font-semibold text-dim mb-1 uppercase tracking-wide">Browse all playlists</h3>
            <p className="text-[11px] text-dim">
              Selecting any video will switch the player to the matching playlist automatically.
            </p>
          </div>
          <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
            {playlists.map((playlist) => (
              <div key={`browser-${playlist.id}`} className="border border-surface rounded-sm">
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-surface">
                  <div>
                    <p className="text-sm font-semibold">{playlist.title}</p>
                    {playlist.note && <p className="text-[11px] text-dim">{playlist.note}</p>}
                  </div>
                  <button
                    className="text-[11px] uppercase tracking-wide text-dim hover:text-accent"
                    onClick={() => handleSelectPlaylist(playlist.id)}
                    type="button"
                  >
                    Activate
                  </button>
                </div>
                <ul className="divide-y divide-surface">
                  {playlist.videos.slice(0, 5).map((video) => (
                    <li key={`${playlist.id}-${video.videoId ?? video.link}`}>
                      <button
                        className={[
                          'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                          playlist.id === activePlaylistId && video.videoId === activeVideoId
                            ? 'bg-accent/10'
                            : 'hover:bg-surface',
                        ].join(' ')}
                        onClick={() => handleSelectVideo(playlist.id, video.videoId)}
                        type="button"
                      >
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt=""
                            className="w-14 h-9 object-cover rounded-sm border border-surface"
                            loading="lazy"
                            width="56"
                            height="36"
                          />
                        ) : (
                          <div className="w-14 h-9 bg-surface rounded-sm border border-surface text-[10px] flex items-center justify-center text-dim">
                            No art
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold line-clamp-1">{video.title}</p>
                          <p className="text-[11px] text-dim">{formatDate(video.published)}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                  {playlist.videos.length === 0 && (
                    <li className="px-3 py-2 text-[11px] text-dim">No videos yet.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

