import { Middleware } from '@reduxjs/toolkit';
import { store } from 'app/store/store';
import { PartialAppConfig } from 'app/types/invokeai';
import React, {
  lazy,
  memo,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { Provider } from 'react-redux';
import { addMiddleware, resetMiddlewares } from 'redux-dynamic-middlewares';
import { $authToken, $baseUrl, $projectId } from 'services/api/client';
import { socketMiddleware } from 'services/events/middleware';
import Loading from '../../common/components/Loading/Loading';
import '../../i18n';
import AppDndContext from '../../features/dnd/components/AppDndContext';

const App = lazy(() => import('./App'));
const ThemeLocaleProvider = lazy(() => import('./ThemeLocaleProvider'));

interface Props extends PropsWithChildren {
  apiUrl?: string;
  token?: string;
  config?: PartialAppConfig;
  headerComponent?: ReactNode;
  middleware?: Middleware[];
  projectId?: string;
}

const InvokeAIUI = ({
  apiUrl,
  token,
  config,
  headerComponent,
  middleware,
  projectId,
}: Props) => {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    console.log({ apiUrl });
    if (token && apiUrl && projectId) {
      $authToken.set(token);
      $baseUrl.set(apiUrl);
      $projectId.set(projectId);
      setIsReady(true);
    } else if (token && apiUrl) {
      $authToken.set(token);
      $baseUrl.set(apiUrl);
      setIsReady(true);
    } else {
      $baseUrl.set('');
      setIsReady(true);
    }

    // reset dynamically added middlewares
    resetMiddlewares();

    // TODO: at this point, after resetting the middleware, we really ought to clean up the socket
    // stuff by calling `dispatch(socketReset())`. but we cannot dispatch from here as we are
    // outside the provider. it's not needed until there is the possibility that we will change
    // the `apiUrl`/`token` dynamically.

    // rebuild socket middleware with token and apiUrl
    if (middleware && middleware.length > 0) {
      addMiddleware(socketMiddleware(), ...middleware);
    } else {
      addMiddleware(socketMiddleware());
    }

    return () => {
      // Reset the API client token and base url on unmount
      $baseUrl.set(undefined);
      $authToken.set(undefined);
      $projectId.set(undefined);
    };
  }, [apiUrl, token, middleware, projectId]);

  return (
    <React.StrictMode>
      <Provider store={store}>
        <React.Suspense fallback={<Loading />}>
          <ThemeLocaleProvider>
            <AppDndContext>
              {isReady && (
                <App config={config} headerComponent={headerComponent} />
              )}
            </AppDndContext>
          </ThemeLocaleProvider>
        </React.Suspense>
      </Provider>
    </React.StrictMode>
  );
};

export default memo(InvokeAIUI);
