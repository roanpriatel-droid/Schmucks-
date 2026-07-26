import {data as routerData, Link, useLoaderData, useParams} from 'react-router';
import type {Route} from './+types/policies.$handle';
import {type Shop} from '@shopify/hydrogen/storefront-api-types';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {pageMeta, toDescription} from '~/lib/seo';

type SelectedPolicies = keyof Pick<
  Shop,
  'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
>;

export const meta: Route.MetaFunction = (args) => {
  const policy = args.data?.policy;
  return pageMeta(args, {
    title: policy?.title ?? 'Policy',
    noindex: !policy,
    description:
      toDescription(policy?.body) ??
      (policy?.title
        ? `${policy.title} for SCHMUCKS — the full text, in plain sight.`
        : undefined),
  });
};

export async function loader({params, context}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as SelectedPolicies;

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const policy = data.shop?.[policyName];

  // Sibling policies for the "other policies" footer nav.
  const others = [
    data.shop?.allShipping,
    data.shop?.allRefund,
    data.shop?.allPrivacy,
    data.shop?.allTerms,
    data.shop?.allSubscription,
  ]
    .filter((item): item is {id: string; title: string; handle: string} =>
      Boolean(item),
    )
    .filter((item) => item.handle !== params.handle);

  if (!policy) {
    // The footer links Shipping/Returns unconditionally, so a policy that
    // hasn't been written in admin yet must not dead-end the customer. Answer
    // 404 for crawlers, but still render a page that points somewhere useful.
    return routerData({policy: null, others}, {status: 404});
  }

  return routerData({policy, others});
}

/** `refund-policy` → `Refund policy`, for the not-yet-published headline. */
function humanize(handle: string) {
  const words = handle.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export default function Policy() {
  const {policy, others} = useLoaderData<typeof loader>();
  const params = useParams();
  const title = policy?.title ?? humanize(params.handle ?? 'Policy');

  return (
    <div className="sx-policy">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs
            crumbs={[{label: 'Policies', to: '/policies'}, {label: title}]}
          />
          <p className="sx-pagehead__eyebrow">Fine Print</p>
          <h1 className="sx-pagehead__title">{title}</h1>
        </div>
      </section>
      <section className="sx-page">
        <div className="sx-wrap">
          <Link className="sx-policy-back" to="/policies">
            ← Back to Policies
          </Link>
          {policy ? (
            <div
              className="sx-prose"
              dangerouslySetInnerHTML={{__html: policy.body}}
            />
          ) : (
            <div className="sx-prose">
              <p>
                This policy hasn&rsquo;t been published yet. Rather than show
                you invented terms, here&rsquo;s the honest version: ask us and
                we&rsquo;ll answer in writing.
              </p>
              <p>
                <Link to="/pages/contact">Email us</Link> and we&rsquo;ll sort
                it out. The <Link to="/pages/faq">FAQ</Link> covers the common
                questions about shipping, sizing and returns.
              </p>
            </div>
          )}
          {others.length ? (
            <div className="sx-policy-others">
              <p className="sx-eyebrow">Other policies</p>
              <ul>
                {others.map((item) => (
                  <li key={item.id}>
                    <Link to={`/policies/${item.handle}`} prefetch="intent">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="sx-policy-help">
            <p>
              Questions about how this applies to your order?{' '}
              <Link to="/pages/contact">Ask us directly</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  fragment PolicyLink on ShopPolicy {
    id
    title
    handle
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
      allShipping: shippingPolicy {
        ...PolicyLink
      }
      allRefund: refundPolicy {
        ...PolicyLink
      }
      allPrivacy: privacyPolicy {
        ...PolicyLink
      }
      allTerms: termsOfService {
        ...PolicyLink
      }
      allSubscription: subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
