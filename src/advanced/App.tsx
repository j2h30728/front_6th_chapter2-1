import ShoppingCart from './components/cart/ShoppingCart';
import GuideToggle from './components/guide/GuideToggle';
import Header from './components/layout/Header';
import Layout from './components/layout/Layout';
import OrderSummary from './components/order/OrderSummary';

const App = () => {
  return (
    <>
      <Header />
      <GuideToggle />
      <Layout>
        <ShoppingCart />
        <OrderSummary />
      </Layout>
    </>
  );
};

export default App;
