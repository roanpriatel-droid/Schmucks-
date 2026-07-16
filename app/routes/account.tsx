import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer
    ? customer.firstName
      ? `Hey, ${customer.firstName}`
      : `Your Account`
    : 'Your Account';

  return (
    <div className="sx-account">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <p className="sx-pagehead__eyebrow">Certified Schmuck</p>
          <h1 className="sx-pagehead__title">{heading}</h1>
        </div>
      </section>
      <section className="sx-page" style={{paddingTop: '1.5rem'}}>
        <div className="sx-wrap">
          <AccountMenu />
          <Outlet context={{customer}} />
        </div>
      </section>
    </div>
  );
}

function AccountMenu() {
  function linkClass({isActive}: {isActive: boolean}) {
    return isActive ? 'active' : undefined;
  }

  return (
    <nav className="sx-account__menu" role="navigation">
      <NavLink to="/account/orders" className={linkClass}>
        Orders
      </NavLink>
      <NavLink to="/account/profile" className={linkClass}>
        Profile
      </NavLink>
      <NavLink to="/account/addresses" className={linkClass}>
        Addresses
      </NavLink>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form className="sx-account__logout" method="POST" action="/account/logout">
      <button type="submit">Sign out</button>
    </Form>
  );
}
