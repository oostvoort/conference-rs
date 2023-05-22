import {lazy, useMemo, useRef, useState} from 'react';
import 'react-quill/dist/quill.snow.css';

// y-websocket seems to be behind in package.json declaration. ignoring for now
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {WebsocketProvider} from "y-websocket";
import * as Y from 'yjs';
import {QuillBinding} from 'y-quill';
import _ from "lodash";
import {useQuery} from "@tanstack/react-query";
import useConfigStore from "../../../../config/store.ts";
import {ENV} from "../../../../config/config.ts";
import {useParams} from "react-router-dom";

const ReactQuill = lazy(() => import('react-quill'));

const userColors = [
  {color: '#30bced', light: '#30bced33'},
  {color: '#6eeb83', light: '#6eeb8333'},
  {color: '#ffbc42', light: '#ffbc4233'},
  {color: '#ecd444', light: '#ecd44433'},
  {color: '#ee6352', light: '#ee635233'},
  {color: '#9ac2c9', light: '#9ac2c933'},
  {color: '#8acb88', light: '#8acb8833'},
  {color: '#1be7ff', light: '#1be7ff33'}
]

// select a random color for this user
const userColor = userColors[_.random(0, 7)]

function MeetingNotesComponents() {
  const quillRef = useRef();

  const isAudioOnly = window.location.pathname.includes('voice')
  const roomPrefix = isAudioOnly ? 'voice' : 'av'
  const {id} = useParams()
  const room = `${roomPrefix}-${id}`

  const name = useConfigStore((state) => state.userName)


  const [value, setValue] = useState('')

  const doc = useMemo(() => new Y.Doc(), []);

  const provider = useQuery<WebsocketProvider>(["provider"], async () => {
    return await new Promise(resolve => {
      const provider = new WebsocketProvider(`${ENV.SERVER_WS_ENDPOINT}/collaborate`, room, doc);

      provider.awareness.setLocalStateField('user', {
        name: name,
        color: userColor.color,
        colorLight: userColor.light
      })

      provider.on('status', (event: string) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (event.status == 'connected') resolve(provider)
      });

      return provider
    })
  }, {
    staleTime: 5000,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    cacheTime: 1000,
    structuralSharing: false,
    retry: 10,
  })

  useQuery(["quillBinding"], () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const quillEditor: any = quillRef?.current?.editor

      if (!quillEditor) throw  Error("quillEditor is undefined")
      return new QuillBinding(doc.getText(), quillEditor, provider.data.awareness)
    }, {
      enabled: provider.isSuccess,
      retry: 10,
      retryDelay: (failureCount) => failureCount * 500,
      onError: err => console.warn(err),
      staleTime: Infinity,
    }
  )

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <ReactQuill theme="snow" value={value} onChange={setValue} ref={quillRef}/>;
}

export default MeetingNotesComponents;
