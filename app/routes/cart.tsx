import {useLoaderData, data, type HeadersFunction} from 'react-router';
import type {Route} from './+types/cart';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {pageMeta} from '~/lib/seo';
import {RescueRail, RESCUE_PRODUCTS_QUERY} from '~/components/RescueRail';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'Your Terrible Decisions',
    description: 'Everything you have decided to buy, in one regrettable list.',
    path: '/cart',
    noindex: true,
  });

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes as string[];
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;
  // An empty cart was a single "start making mistakes" link. Carry a few real
  // products so the page always has something to buy on it.
  const [current, rescue] = await Promise.all([
    cart.get(),
    context.storefront
      .query(RESCUE_PRODUCTS_QUERY, {cache: context.storefront.CacheShort()})
      .catch(() => null),
  ]);
  return {cart: current, rescue: rescue?.products?.nodes ?? []};
}

export default function Cart() {
  const {cart, rescue} = useLoaderData<typeof loader>();
  const isEmpty = !(cart?.lines?.nodes?.length ?? 0);

  return (
    <div className="sx-cart-page">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <p className="sx-pagehead__eyebrow">Cart</p>
          <h1 className="sx-pagehead__title">Your Terrible Decisions</h1>
        </div>
      </section>
      <section className="sx-wrap sx-cart-page__grid">
        <CartMain layout="page" cart={cart} />
      </section>
      {isEmpty ? (
        <RescueRail
          products={rescue as never}
          eyebrow="Straight off the press"
          title="Start here"
        />
      ) : null}
    </div>
  );
}
