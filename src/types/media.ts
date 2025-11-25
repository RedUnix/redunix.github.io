export type FavoriteVideo = {
  title: string;
  url: string;
  channel?: string;
  platform?: string;
  added?: string;
  note?: string;
  videoId?: string;
};

export type ChannelWatch = {
  name: string;
  channelId: string;
  url: string;
  note?: string;
};

export type YouTubePlaylist = {
  name: string;
  playlistId: string; // Will be extracted from URL if not provided
  url: string;
  note?: string;
};

export type PlaylistVideo = {
  videoId?: string;
  title: string;
  link: string;
  published: string;
  thumbnail?: string;
  channelName: string;
  channelUrl: string;
};

export type Playlist = {
  id: string;
  title: string;
  note?: string;
  url: string;
  videos: PlaylistVideo[];
};

export type MediaPlayEventDetail = {
  playlistId: string;
  videoId?: string;
};


