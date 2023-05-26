import {useQuery} from "@tanstack/react-query";
// y-websocket seems to be behind in package.json declaration. ignoring for now
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {WebsocketProvider} from "y-websocket";
import {ENV} from "../../config/config";
import _ from "lodash";
import useConfigStore from "../../config/store";
import * as ReactQuill from "react-quill";
import {RefObject, useMemo, useState} from "react";
import {QuillBinding} from "y-quill";
import * as Y from "yjs";

type PropsType = {
  room: string,
  quill?: RefObject<ReactQuill>
}

const userColors = [
  {color: '#30bced', colorLight: '#30bced33'},
  {color: '#6eeb83', colorLight: '#6eeb8333'},
  {color: '#ffbc42', colorLight: '#ffbc4233'},
  {color: '#ecd444', colorLight: '#ecd44433'},
  {color: '#ee6352', colorLight: '#ee635233'},
  {color: '#9ac2c9', colorLight: '#9ac2c933'},
  {color: '#8acb88', colorLight: '#8acb8833'},
  {color: '#1be7ff', colorLight: '#1be7ff33'}
]

const userColor = userColors[_.random(0, 7)]

const useCollaborate = ({room, quill}: PropsType) => {
  const name = useConfigStore((state) => state.userName)
  const doc = useMemo(() => new Y.Doc({ guid: room }), [room]);
  const [quillBinding, setQuillBinding] = useState<QuillBinding | null>(null)

  useQuery(
    ["provider", room, name],
    async () => {
      const provider: WebsocketProvider = await new Promise(resolve => {
        const provider = new WebsocketProvider(
          `${ENV.SERVER_WS_ENDPOINT}/collaborate`,
          room,
          doc
        )
        provider.awareness.setLocalStateField('user', {
          name,
          ...userColor
        })

        provider.on('status', (event: {status: string}) => {
          if (event.status === 'connected') resolve(provider)
        })

      })

      setQuillBinding(prevQuillBinding => {
        if (prevQuillBinding) return prevQuillBinding
        return new QuillBinding(doc.getText(), quill?.current?.editor, provider.awareness)
      })

      return provider
    },
    {
      enabled: !!quill,
      staleTime: Infinity,
      retry: 10,
    }
  )

  return quillBinding
}

export default useCollaborate