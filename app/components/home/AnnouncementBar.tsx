import {useEffect, useState} from 'react';

const MESSAGES = [
  'FREE US SHIPPING ON ORDERS $100+',
  'STACK 2 SHIRTS, SAVE 10% — AUTO-APPLIED AT CHECKOUT',
  'NEW SCHMUCK DROPS EVERY WEEK',
  '30-DAY NO-QUESTIONS RETURNS (WE MIGHT ASK ONE QUESTION)',
];

export function AnnouncementBar() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) return;
    const id = setInterval(() => {
      setI((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sx-announce" role="region" aria-label="Announcements">
      <div className="sx-announce__inner">
        <span className="sx-announce__dot">★</span>
        <span className="sx-announce__msg" key={i}>
          {MESSAGES[i]}
        </span>
        <span className="sx-announce__dot">★</span>
      </div>
    </div>
  );
}
