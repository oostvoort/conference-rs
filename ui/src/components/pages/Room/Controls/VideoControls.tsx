'use client'

import {Button} from "../../../Button.tsx";
import useStore from "../../../../hooks/useRoom/useStore.ts";
import {useNavigate} from "react-router-dom";
import useIsAudioOnly from "../../../../hooks/useRoom/useIsAudioOnly";

export const VideoControls = () => {

    const navigate = useNavigate()

    const [
        toggleMedia,
        leave,
        mediaState
    ] = useStore(state => [
        state.toggleMedia,
        state.leave,
        state.mediaState
    ])

    const isAudioOnly = useIsAudioOnly()

  function handleLeaveCall() {
    leave()
    navigate("/")
  }

  function handleMicrophone() {
    toggleMedia('audio')
  }

  function handleVideo() {
    toggleMedia('video')
  }

  return (
    <div className={'flex gap-2'}>
      <Button
        onClick={handleMicrophone}
        imageProps={
          {
            src: `${mediaState.audio ? '/assets/icon_mic_on.svg' : '/assets/icon_mic_off.svg'}`,
            alt: 'Microphone',
            width: 16,
            height: 31,
          }
        }
        buttonClass={'flex py-3 px-6'}
      />
      <Button
        onClick={handleLeaveCall}
        imageProps={
          {
            src: '/assets/icon_disconnect_default.svg',
            alt: 'Disconnect',
            width: 35,
            height: 42,
          }
        }
        buttonClass={'flex py-3 px-6'}
      />
        {
            !isAudioOnly && (<Button
                onClick={handleVideo}
                imageProps={
                    {
                        src: `${mediaState.video ? '/assets/icon_cam_on.svg' : '/assets/icon_cam_off.svg'}`,
                        alt: 'Video',
                        width: 24,
                        height: 19,
                    }
                }
                buttonClass={'flex py-3 px-6'}
            />)
        }
    </div>
  )
}
