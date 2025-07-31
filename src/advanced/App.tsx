import ShoppingCart from './components/cart/ShoppingCart';
import GuideToggle from './components/guide/GuideToggle';
import Header from './components/layout/Header';
import Layout from './components/layout/Layout';
import OrderSummary from './components/order/OrderSummary';
import { AppProvider } from './lib/store';

const App = () => {
  return (
    <AppProvider>
      <Header />
      <GuideToggle />
      <Layout>
        <ShoppingCart />
        <OrderSummary />
      </Layout>
    </AppProvider>
  );
};

export default App;
