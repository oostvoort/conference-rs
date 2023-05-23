// @ts-ignore
import React, {lazy, Suspense} from 'react'
import useStore from "../../../hooks/useRoom/useStore.ts";
import useIsAudioOnly from "../../../hooks/useRoom/useIsAudioOnly";

// Dynamic Import
const DynamicVideo = lazy(() => import("../../../components/shared/Video"))
// end Dynamic Import

type PropsType = {
    isShareScreen: boolean,
    isShowMemo: boolean,
    screenSizeObserver?: number
}

const ParticipantList = ({isShareScreen = false, isShowMemo, screenSizeObserver}: PropsType) => {
    const isAudioOnly = useIsAudioOnly()

    const [
        participants,
    ] = useStore(state => [
        state.participants,
    ])

    return (
        <>
            {
                participants.map(participant => {
                    return (
                        <div key={participant.id} className={'relative'}>
                            <Suspense fallback={
                                <div className={"text-center"}><p className={"text-white"}>Loading participant video
                                    ...</p></div>
                            }>
                                <DynamicVideo
                                    screenSizeObserver={screenSizeObserver}
                                    isVoiceMode={isAudioOnly}
                                    isShowMemo={isShowMemo}
                                    isShareScreen={isShareScreen}
                                    autoPlay={true}
                                    controls={false}
                                    playsInline={true}
                                    totalParticipants={participants.length + 1}
                                    className={'bg-primary3 w-full h-full rounded-xl'}
                                    mediaStream={participant.mediaStream}
                                />
                            </Suspense>
                            <div
                                className={'absolute bottom-0 left-0 m-2 py-1 px-3 flex gap-3 bg-gray-400 rounded-2xl'}>
                                {
                                    !participant.mediaState().audio ? (
                                        <img src={'/assets/icon_mic_off.svg'} alt={'Screen share'} width={20}
                                             height={35}/>
                                    ) : <></>
                                }
                                <p>{participant.displayName}</p>
                            </div>
                        </div>
                    )
                })
            }
        </>
    )
}

export default ParticipantList
