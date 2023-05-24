// @ts-ignore
import React, {lazy, Suspense, useRef} from 'react'
import 'twin.macro'
import {ParticipantName, ParticipantsContainer, VideoRenderContainer,} from './_participants.comp'
import useStore from "../../../hooks/useRoom/useStore";
import {Panel} from "react-resizable-panels";
import {
    LeftContainer,
    MainContainer,
    ParticipantContainer,
    RightContainer
} from "../../pages/Room/Participants/_participant.comp";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css"
import useMeetingNotesStore from "../../../config/useMeetingNotesStore.ts";
import useIsAudioOnly from "../../../hooks/useRoom/useIsAudioOnly";
import useActiveSpeaker from "../../../hooks/useRoom/useActiveSpeaker";
import clsx from "clsx";

// Dynamic Import
const DynamicParticipantList = lazy(() => import("../ParticipantList"))
const DynamicVideo = lazy(() => import("../Video"))
// end Dynamic Import

const Participants = () => {
    const [panelContainerSize, setPanelContainerSize] = React.useState<number>(0)
    const memoSize = useMeetingNotesStore((state) => state.meetingNotesSize)

    const [
        participants,
        user,
        [screensharer]
    ] = useStore(state => [
        state.participants,
        state.user,
        state.screenSharers
    ])

    const isAudioOnly = useIsAudioOnly()

    const participantPanel = useRef(null)

    const showShareScreen = !!screensharer

    const { isUser } = useActiveSpeaker()

    React.useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                setPanelContainerSize(entry.contentRect.width)
            }
        })
        if (participantPanel.current) {
            resizeObserver.observe(participantPanel.current)
        }
        return () => resizeObserver.disconnect()
    }, [])

    return (
        <>
            <Panel minSize={15} collapsible={true}>
                <ParticipantContainer isShowMemo={memoSize != 0} isShareScreen={showShareScreen}>
                    <LeftContainer isShareScreen={showShareScreen} isShowMemo={memoSize != 0}>
                        <SimpleBar tw={"h-full"} autoHide>
                            <MainContainer ref={participantPanel}>
                                <ParticipantsContainer totalParticipants={participants.length + 1}
                                                       isShowMemo={memoSize != 0} isShareScreen={showShareScreen}>
                                    {
                                        !!user && (
                                            <VideoRenderContainer tw={'relative'}>
                                                <Suspense fallback={
                                                    <div className={"text-center"}><p className={"text-white"}>Loading
                                                        participant video ...</p></div>
                                                }>
                                                    <DynamicVideo
                                                        screenSizeObserver={panelContainerSize}
                                                        isVoiceMode={isAudioOnly}
                                                        isShowMemo={memoSize != 0}
                                                        isShareScreen={showShareScreen}
                                                        totalParticipants={participants.length + 1}
                                                        autoPlay={true}
                                                        controls={false}
                                                        playsInline={true}
                                                        mediaStream={user.mediaStream}
                                                        className={clsx([
                                                            {'border-4 border-secondary1 divide-solid': isUser}
                                                        ])}
                                                    />
                                                </Suspense>
                                            </VideoRenderContainer>
                                        )
                                    }
                                    <Suspense fallback={
                                        <div className={"text-center"}><p className={"text-white"}>Loading Participant
                                            List ...</p></div>
                                    }>
                                        <DynamicParticipantList screenSizeObserver={panelContainerSize}
                                                                isShareScreen={showShareScreen}
                                                                isShowMemo={memoSize != 0}/>
                                    </Suspense>
                                </ParticipantsContainer>
                            </MainContainer>
                        </SimpleBar>
                    </LeftContainer>
                    {!!screensharer && (
                        <RightContainer>
                            <div className={'relative'}>
                                <DynamicVideo
                                    isVoiceMode={false}
                                    isShowMemo={memoSize != 0}
                                    isShareScreen={!!screensharer}
                                    totalParticipants={participants.length + 1}
                                    autoPlay={true}
                                    controls={false}
                                    playsInline={true}
                                    tw={'bg-primary3 w-full h-full rounded-xl'}
                                    mediaStream={screensharer.mediaStream}
                                />
                                <ParticipantName>{screensharer.displayName.replace('-ScreenShare', '')}</ParticipantName>
                            </div>
                        </RightContainer>
                    )}
                </ParticipantContainer>
            </Panel>
        </>
    )
}

export default Participants