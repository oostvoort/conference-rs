import {useParams} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";
import ScreenShare from "../../lib/MediasoupClient/ScreenShare";
import useStore from "./useStore";
import useIsAudioOnly from "./useIsAudioOnly";

const useShareScreen = () => {
  const {id} = useParams()

  const isAudioOnly = useIsAudioOnly()

  const [myScreenShare, updateMyScreenShare, user] = useStore(state => [
    state.myScreenShare, state.updateMyScreenShare, state.user
  ])

  return useMutation(
    ['share', id],
    async() => {
      if (myScreenShare || !id) return
      const createScreenShare: Promise<ScreenShare> = new Promise(resolve => {
        const screenShare = new ScreenShare(id, user?.displayName ?? '', isAudioOnly)
        screenShare.eventEmitter.on('connected', () => resolve(screenShare))
      })
      updateMyScreenShare(await createScreenShare)
    },
    {
      onMutate: () => {
        console.info("Sharing Screen..")
      },
      onSuccess: () => {
        console.info("Shared Screen!")
      },
      onError: (e: Error) => {
        console.error(`useRoom.shareScreen Error : ${e}`)
      }
    }
  )
}

export default useShareScreen