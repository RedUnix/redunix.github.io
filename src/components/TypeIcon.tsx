import React from 'react';
import { FileText, Headphones, Video, Globe } from 'lucide-react';

export const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'Audio': return <Headphones size={18} />;
    case 'Video': return <Video size={18} />;
    case 'Article': return <FileText size={18} />;
    case 'Resource': return <Globe size={18} />;
    default: return <Globe size={18} />;
  }
};

