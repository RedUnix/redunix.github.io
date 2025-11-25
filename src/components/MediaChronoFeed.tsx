import type { PlaylistVideo } from '../types/media';

type Props = {
  items: PlaylistVideo[];
  playlistId: string;
};

const dispatchPlay = (playlistId: string, videoId: string) => {
  window.dispatchEvent(
    new CustomEvent('media-player:play', {
      detail: { playlistId, videoId },
    })
  );
};

export function MediaChronoFeed({ items, playlistId }: Props) {
  if (items.length === 0) {
    return (
      <div className="border border-dashed border-surface rounded-sm p-6 text-center text-sm text-dim">
        Unable to load the feed right now. Refresh or check the channel IDs.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <button
          key={`${playlistId}-${item.videoId ?? item.link}`}
          className="flex gap-4 border border-surface hover:border-accent rounded-sm p-3 transition-colors text-left"
          type="button"
          onClick={() => item.videoId && dispatchPlay(playlistId, item.videoId)}
        >
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.title ?? 'Video thumbnail'}
              className="w-24 h-16 object-cover rounded-sm border border-surface"
              loading="lazy"
              width="96"
              height="64"
            />
          ) : (
            <div className="w-24 h-16 bg-surface flex items-center justify-center text-xs text-dim border border-surface rounded-sm">
              No preview
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-xs mb-1 line-clamp-2">{item.title}</p>
            <p className="text-[11px] text-dim">{item.channelName}</p>
            <p className="text-[10px] text-dim mt-1">
              {new Date(item.published).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}


