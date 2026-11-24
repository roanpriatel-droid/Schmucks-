import {data} from 'react-router';
import type {Route} from './+types/api.newsletter';

/**
 * Newsletter signup.
 *
 * The footer form and the exit-intent modal used to call `setDone(true)` and
 * throw the address away — every "You're in" was a lie and the list stayed
 * empty. This action creates a Shopify customer with email-marketing consent,
 * so signups land in admin (Customers → Email subscribers) and can be mailed
 * with Shopify Email.
 *
 * A random password is required by `customerCreate`; the customer never uses
 * it (they can claim the account later through the normal login flow).
 */
export type NewsletterResult =
  | {ok: true; already?: boolean}
  | {ok: false; error: string};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return data<NewsletterResult>({ok: false, error: 'Method not allowed'}, {status: 405});
  }
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  // Honeypot: bots fill every field, people never see this one.
  if (form.get('company')) return data<NewsletterResult>({ok: true});

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return data<NewsletterResult>(
      {ok: false, error: 'That doesn’t look like an email address.'},
      {status: 400},
    );
  }

  try {
    const result = await context.storefront.mutate(NEWSLETTER_MUTATION, {
      variables: {
        input: {
          email,
          password: `${crypto.randomUUID()}Aa1!`,
          acceptsMarketing: true,
        },
      },
    });
    const errors = result?.customerCreate?.customerUserErrors ?? [];
    if (errors.length === 0) return data<NewsletterResult>({ok: true});
    // Already a customer: they're on the list (or can opt in at checkout).
    if (errors.some((e) => e.code === 'TAKEN' || e.code === 'CUSTOMER_DISABLED')) {
      return data<NewsletterResult>({ok: true, already: true});
    }
    console.error('newsletter customerCreate', errors);
    return data<NewsletterResult>(
      {ok: false, error: 'We couldn’t add you just now. Try again in a minute.'},
      {status: 422},
    );
  } catch (error) {
    console.error('newsletter signup failed', error);
    return data<NewsletterResult>(
      {ok: false, error: 'We couldn’t add you just now. Try again in a minute.'},
      {status: 502},
    );
  }
}

export async function loader() {
  return new Response(null, {status: 404});
}

const NEWSLETTER_MUTATION = `#graphql
  mutation NewsletterSignup($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;
