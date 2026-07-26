import {useState} from 'react';

/**
 * Share links for long-form pages. Deliberately plain anchors — no third-party
 * share SDKs, which would need CSP exceptions and load tracking scripts.
 * The copy button degrades to nothing if the clipboard API is unavailable.
 */
export function ShareRow({url, title}: {url?: string; title: string}) {
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context, permissions) — leave the UI as-is.
    }
  }

  return (
    <div className="sx-share">
      <span className="sx-eyebrow">Inflict this on someone</span>
      <div className="sx-share__links">
        <a
          className="sx-share__link"
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          X / Twitter
        </a>
        <a
          className="sx-share__link"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          Facebook
        </a>
        <a
          className="sx-share__link"
          href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        >
          Email
        </a>
        <button
          className="sx-share__link"
          type="button"
          onClick={() => void copy()}
        >
          {copied ? 'Copied ✓' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
