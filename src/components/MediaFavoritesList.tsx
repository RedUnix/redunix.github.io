import type { FavoriteVideo } from '../types/media';

type Props = {
  videos: FavoriteVideo[];
};

const dispatchPlay = (playlistId: string, videoId: string) => {
  window.dispatchEvent(
    new CustomEvent('media-player:play', {
      detail: { playlistId, videoId },
    })
  );
};

export function MediaFavoritesList({ videos }: Props) {
  return (
    <div className="space-y-3">
      {videos.map((video) => {
        const canPlayInline = Boolean(video.videoId);
        return (
          <div key={video.title} className="border border-surface rounded-sm p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{video.title}</p>
              {video.platform && <span className="text-[10px] uppercase tracking-wide text-dim">{video.platform}</span>}
            </div>
            <p className="text-xs text-dim">
              {video.channel} {video.channel && video.platform ? '·' : ''} {video.platform && video.platform !== '' && video.platform}
            </p>
            {video.note && <p className="text-xs mt-2 text-dim">{video.note}</p>}
            <div className="mt-3 flex gap-2">
              {canPlayInline ? (
                <button
                  type="button"
                  className="px-3 py-1 rounded-sm text-xs font-semibold border border-accent text-accent hover:bg-accent/10 transition-colors"
                  onClick={() => video.videoId && dispatchPlay('favorites', video.videoId)}
                >
                  Play Inline
                </button>
              ) : (
                <span className="text-[11px] text-dim">Unable to embed · opens externally</span>
              )}
              {!canPlayInline && (
                <a
                  href={video.url}
                  className="px-3 py-1 rounded-sm text-xs font-semibold border border-surface hover:border-accent transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Source
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


