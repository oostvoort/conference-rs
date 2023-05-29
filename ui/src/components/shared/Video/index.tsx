import React from 'react'
import { VideoHTMLAttributes, useEffect, useRef, useMemo } from 'react'
import {ImageVoiceComp, VideoComp, VoiceComp} from './_video.comp'
import "twin.macro"

type PropsType = VideoHTMLAttributes<HTMLVideoElement> & {
  tracks?: MediaStreamTrack[]
  mediaStream?: MediaStream,
  totalParticipants?: number,
  isShareScreen: boolean,
  isShowMemo: boolean,
  isVoiceMode?: boolean,
  screenSizeObserver?: number
}

export default function Video({ tracks, mediaStream, totalParticipants = 1, isShareScreen = false, isShowMemo = false, isVoiceMode = false, screenSizeObserver = 0, ...props }: PropsType) {
  return isVoiceMode ?
      <React.Fragment>
        <VoiceMode
            {...props}
            tracks={tracks}
            mediaStream={mediaStream}
            totalParticipants={totalParticipants}
            screenSizeObserver={screenSizeObserver}
            isShareScreen={isShareScreen}
            isShowMemo={isShowMemo}
        />
      </React.Fragment>
      :
      <React.Fragment>
        <VideoMode
            {...props}
            tracks={tracks}
            mediaStream={mediaStream}
            totalParticipants={totalParticipants}
            isShareScreen={isShareScreen}
            isShowMemo={isShowMemo}
            isVoiceMode={false}
        />
      </React.Fragment>
}

const VideoMode = ({ tracks, mediaStream, totalParticipants = 1, isShareScreen = false, isShowMemo = false, ...props }: PropsType) => {
  const srcObject = useMemo(() => {
    return mediaStream ? mediaStream : new MediaStream(tracks ?? [])
  }, [mediaStream, tracks])

  const refVideo = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!refVideo.current) return
    refVideo.current.srcObject = srcObject
  }, [srcObject])

  return <VideoComp ref={refVideo} {...props} totalParticipants={totalParticipants} isShareScreen={isShareScreen} isShowMemo={isShowMemo} />
}

const VoiceMode = ({tracks, mediaStream, totalParticipants, screenSizeObserver, isShareScreen, isShowMemo, ...props} : any) => {
  const srcObject = useMemo(() => {
      return mediaStream ? mediaStream : new MediaStream(tracks ?? [])
  }, [mediaStream, tracks])

  const refAudio = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!refAudio.current) return
    refAudio.current.srcObject = srcObject
  }, [srcObject])

  return <VoiceComp {...props} totalParticipant={totalParticipants} screenSizeObserver={screenSizeObserver} isShareScreen={isShareScreen} isShowMemo={isShowMemo} >
    <div tw={"w-full h-full flex justify-center items-center"}>
      <ImageVoiceComp src={"/assets/icon_screen_off.svg"} alt={""} />
    </div>
    <audio controls={false} ref={refAudio} muted={props.muted} />
  </VoiceComp>
}