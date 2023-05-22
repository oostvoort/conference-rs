import React, {lazy, Suspense} from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import 'twin.macro'
const App = lazy(() => import('./App.tsx'))

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
      <QueryClientProvider client={queryClient}>
          <Suspense fallback={
              <div tw={"w-full h-full flex flex-col justify-center items-center"}>
                  <p tw={"text-white"}>Initializing ...</p>
              </div>
          }>
              <App />
          </Suspense>
      </QueryClientProvider>
  </React.StrictMode>,
)
