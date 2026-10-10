// Brand mark: logo image + CHEFSTAR. wordmark. badge = white tile so the logo reads on dark backgrounds.
export default function Logo({ size = 40, badge = false, text = true, stacked = false, textClass = 'text-gold' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${stacked ? 'flex-col' : ''}`}>
      <img src={`${import.meta.env.BASE_URL}logo.png`} alt={text ? '' : 'Chef Star Kitchen, Kano'}
        style={{ width: size, height: size }} className={`shrink-0 object-contain ${badge ? 'rounded-lg bg-white p-0.5' : ''}`} />
      {text && <span className={`font-serif italic leading-none ${stacked ? 'text-2xl' : 'text-xl'} ${textClass}`}>CHEFSTAR.</span>}
    </span>
  );
}
