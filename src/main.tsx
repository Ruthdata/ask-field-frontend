import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { FormProvider } from '@context/FormContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
<React.StrictMode>
  <Toaster />
    <BrowserRouter>
      <Provider store={store}>
       <FormProvider>
        <App />
       </FormProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
