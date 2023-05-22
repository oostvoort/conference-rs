import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider,} from "react-router-dom";
import {lazy, Suspense} from "react";

const Home = lazy(() => import("./pages/Home"))
const Room = lazy(() => import("./pages/Room"))
const NotFound = lazy(() => import("./pages/NotFound.tsx"))


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={"/"} >
      <Route path={"/"} element={
        <Suspense fallback={
          <div tw={"w-full h-full flex flex-col justify-center items-center"}>
            <p tw={"text-white"}>Loading ...</p>
          </div>
        }>
          <Home/>
        </Suspense>
      }/>
      <Route path={"/room"} element={
        <Suspense fallback={
          <div tw={"w-full h-full flex flex-col justify-center items-center"}>
            <p tw={"text-white"}>Loading ...</p>
          </div>
        }>
          <Room isAudioOnly={false}/>
        </Suspense>
      }>
        <Route path={":id"} element={
          <Suspense fallback={
            <div tw={"w-full h-full flex flex-col justify-center items-center"}>
              <p tw={"text-white"}>Loading ...</p>
            </div>
          }>
            <Room isAudioOnly={false}/>
          </Suspense>
        }/>
      </Route>
      <Route path={"/voice"} element={
        <Suspense fallback={
          <div tw={"w-full h-full flex flex-col justify-center items-center"}>
            <p tw={"text-white"}>Loading ...</p>
          </div>
        }>
          <Room isAudioOnly={true}/>
        </Suspense>
      }>
        <Route path={":id"} element={
          <Suspense fallback={
            <div tw={"w-full h-full flex flex-col justify-center items-center"}>
              <p tw={"text-white"}>Loading ...</p>
            </div>
          }>
            <Room isAudioOnly={true}/>
          </Suspense>
        }/>
      </Route>
      <Route path={"*"} element={
        <Suspense fallback={
          <div tw={"w-full h-full flex flex-col justify-center items-center"}>
            <p tw={"text-white"}>Loading ...</p>
          </div>
        }>
          <NotFound/>
        </Suspense>
      }/>
    </Route>
  )
)

function App() {

  return (
    <RouterProvider router={router}/>
  )
}

export default App
