import { useState } from 'react';
// Image with a royal-tinted placeholder when src is empty or fails to load.
export default function Img({ src, alt = '', className = '' }) {
  const [bad, setBad] = useState(false);
  if (!src || bad) return <div role="img" aria-label={alt} className={`bg-gradient-to-br from-violet-100 via-sand to-amber-100 ${className}`} />;
  return <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} className={`object-cover ${className}`} />;
}
