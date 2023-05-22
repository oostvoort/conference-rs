import {useParams} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";
import useStore from "./useStore";
import {useCallback, useState} from "react";
import useOnActionBroadcast from "./useOnActionBroadcast";
import useConfigStore from "../../config/store";

const useJoinRoom = (isAudioOnly = false) => {
  const {id} = useParams()
  const [joinRoom, attachEvent] = useStore(state => [state.joinRoom, state.attachEvent])
  const [, setHasRun] = useState(false)
  const onActionBroadcast = useOnActionBroadcast()
  const updateUserName = useConfigStore(state => state.updateUserName)

  const joinRoomMutation = useMutation(
    ['join', id],
    async({ displayName, isAudioOnly }: { displayName: string, isAudioOnly: boolean } ) => {
      if (!id) return
      await joinRoom(id, displayName, isAudioOnly)
      // separating onActionBroadcast because I want to be able to react to actionBroadcasts in a useHook
      attachEvent('actionBroadcast', onActionBroadcast)
      const user = useStore.getState().user
      updateUserName(user?.displayName ?? '')
    },
    {
      onMutate: () => {
        console.info("Joining room..")
      },
      onSuccess: () => {
        console.info("Joined Room!")
      },
      onError: (e: Error) => {
        console.error(`useRoom.joinRoom Error : ${e}`)
      }
    }
  )

  const { mutate: joinRoomMutate } = joinRoomMutation

  const mutate = useCallback( ({ displayName }: { displayName: string } ) => {
    /// putting it inside this setter to make sure this only runs once when used in conjunction to a useEffect
    /// need to investigate further why this keeps happening
    setHasRun(prevHasRun => {
      if (!prevHasRun) joinRoomMutate({ displayName, isAudioOnly })
      return true
    })
  }, [setHasRun, joinRoomMutate, isAudioOnly])

  return {
    ...joinRoomMutation,
    mutate
  }
}

export default useJoinRoom