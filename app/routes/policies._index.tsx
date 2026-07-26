import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {Reveal} from '~/components/Reveal';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'Policies',
    description:
      'Shipping, returns, privacy and terms for SCHMUCKS — written plainly, linked in one place.',
  });

/**
 * Plain-English framing for each policy so the index is scannable. These
 * describe what the document covers; the binding wording is the policy itself.
 */
const POLICY_BLURBS: Record<string, string> = {
  'refund-policy':
    'Returns and exchanges — how to send a shirt back and what happens next.',
  'shipping-policy':
    'How orders get made, packed and shipped, and what to do if one goes missing.',
  'privacy-policy':
    'What data we collect when you shop, why we have it, and how to get it removed.',
  'terms-of-service':
    'The rules for using this site and buying from it. Dry, but binding.',
  'subscription-policy':
    'Terms covering any recurring or subscription purchase.',
  'contact-information': 'How to reach an actual person about an order.',
};

export async function loader({context}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.shippingPolicy,
    shopPolicies?.refundPolicy,
    shopPolicies?.privacyPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <div className="sx-policies">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'Policies'}]} />
          <p className="sx-pagehead__eyebrow">The Boring But Important Bits</p>
          <h1 className="sx-pagehead__title">Policies</h1>
          <p className="sx-pagehead__desc">
            The legal wording lives here in full. If you just want a straight
            answer about an order, the{' '}
            <Link className="sx-inline-link" to="/pages/faq">
              FAQ
            </Link>{' '}
            is faster.
          </p>
        </div>
      </section>
      <section className="sx-page">
        <div className="sx-wrap">
          <Reveal className="sx-policy-cards">
            {policies.map((policy) => (
              <Link
                className="sx-policy-card"
                key={policy.id}
                to={`/policies/${policy.handle}`}
                prefetch="intent"
              >
                <h2 className="sx-policy-card__title">{policy.title}</h2>
                <p className="sx-policy-card__dek">
                  {POLICY_BLURBS[policy.handle] ??
                    'The full policy text, straight from the shop.'}
                </p>
                <span className="sx-policy-card__cta">Read it →</span>
              </Link>
            ))}
          </Reveal>
          <div className="sx-policy-help">
            <p>
              Still stuck? <Link to="/pages/contact">Email a human</Link> — we
              answer questions about orders faster than we answer questions
              about ourselves.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
