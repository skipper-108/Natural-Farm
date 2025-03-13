import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Home from "./views/Home/Home"
import About from "./views/About/About"
import Products from "./views/Products/Products"
import Contact from "./views/Contact/Contact"
import Account from "./views/Account/Account"
import Cart from "./views/Cart/Cart"
import Checkout from './views/CheckOut/CheckOut';
import OrderConfirmation from './views/OrderConfirmation/OrderConfirmation';
import  OrderTracking  from './views/OrderTracking/OrderTracking';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter ([
   
  {
    path: '/',
    element: <Home/>,
  },
  {
    path: '/about',
    element: <About/>
  },
  {
    path: '/products',
    element: <Products/>
  },
  {
    path: '/contact',
    element: <Contact/>
  },
  {
    path: '/account',
    element: <Account/>
  },
  {
    path: '/cart',
    element: <Cart/>
  },
  {
    path: '/checkout',
    element: <Checkout/>
  },
  {
    path: '/order-confirmation/:orderId',
    element: <OrderConfirmation/>
  },
  {
    path: '/ordertracking',
    element: <OrderTracking/>
  }
])


root.render(<RouterProvider router={router}/>)