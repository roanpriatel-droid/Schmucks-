const TIERS = [
  {qty: 1, label: 'One Shirt', note: 'A cry for help', save: 'Full Price'},
  {qty: 2, label: 'Two Shirts', note: 'Now we’re talking', save: 'SAVE 10%'},
  {qty: 3, label: 'Three Shirts', note: 'A lifestyle', save: 'SAVE 20%'},
  {
    qty: 4,
    label: 'Four+ Shirts',
    note: 'Fully committed idiot',
    save: 'SAVE 30%',
    best: true,
  },
];

export function StackLadder() {
  return (
    <section className="sx-stack" aria-labelledby="sx-stack-title">
      <div className="sx-wrap">
        <p className="sx-eyebrow" style={{textAlign: 'center'}}>
          Stack &amp; Save
        </p>
        <h2 className="sx-stack__title" id="sx-stack-title">
          BUY MORE, LOOK <em>DUMBER</em> FOR LESS
        </h2>
        <p className="sx-stack__sub">
          Mix &amp; match any shirts. The more terrible decisions you stack, the
          more you save. Discount applies automatically at checkout — no code, no
          thinking required.
        </p>

        <div className="sx-board" role="table" aria-label="Stack and save pricing">
          {TIERS.map((tier) => (
            <div
              key={tier.qty}
              role="row"
              className={`sx-board__row ${tier.best ? 'sx-board__row--best' : ''}`}
            >
              {tier.best && <span className="sx-board__flag">Best Deal</span>}
              <span className="sx-board__qty sx-display" role="cell">
                {tier.qty}
                {tier.best ? '+' : ''}
              </span>
              <span className="sx-board__label" role="cell">
                {tier.label}
                <small>{tier.note}</small>
              </span>
              <span className="sx-board__save" role="cell">
                {tier.save}
              </span>
            </div>
          ))}
        </div>

        <p className="sx-stack__fine">
          Auto-applied at checkout · Mix &amp; match · Stacks with free shipping
        </p>
      </div>
    </section>
  );
}
