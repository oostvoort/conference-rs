import {useNavigate, useParams} from "react-router-dom";
import useConfigStore from "../../config/store.ts";
import React, {useRef} from "react";
import 'twin.macro'
import useJoinRoom from "../../hooks/useRoom/useJoinRoom";
import Controls from "../../components/pages/Room/Controls";
import useStore from "../../hooks/useRoom/useStore.ts";
import {Panel, PanelGroup} from "react-resizable-panels";
import {VerticalPanelHandler} from "../../components/shared/PanelBar/VerticalPanelHandler.tsx";
import {HorizontalPanelHandler} from "../../components/shared/PanelBar/HorizontalPanelHandler.tsx";
import {RoomContainer} from "../Room/_room.comp.tsx";
import MeetingNotes from "../../components/pages/Room/MeetingNotes";
import {MediaStream} from "../../components/shared/MediaStream";
import {ScreenShare} from "../../components/shared/MediaStream/ScreenShare.tsx";
import useActiveSpeaker from "../../hooks/useRoom/useActiveSpeaker.ts";
import clsx from "clsx";
import useRoomStateStore from "../../config/useRoomStateStore.ts";

export default function TestRoom({isAudioOnly}: { isAudioOnly: boolean }) {
    const [, setIsMemoShow] = React.useState<boolean>(false)
    const {id} = useParams()
    const [panelContainerSize, setPanelContainerSize] = React.useState<number>(0)
    const participantPanel = useRef(null)

    const { setRoomId, setOnlyVoice } = useRoomStateStore()
    const userName: string = useConfigStore(state => state.userName)

    const {mutate} = useJoinRoom(isAudioOnly)
    const push = useNavigate()

    React.useEffect(() => {
        if (userName === '' || !id || Number(id) <= 0) {
            setRoomId(Number(id))
            setOnlyVoice(isAudioOnly ? true : false)
            push('/')
        }
    }, [userName, id])

    const [
        user,
        participants,
        [screenSharer]
    ] = useStore(state =>
        [
            state.user,
            state.participants,
            state.screenSharers
        ]
    )

    React.useEffect(() => {
        if (!userName) return
        mutate({displayName: userName})
    }, [id, mutate, userName])

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

    const { isUser, activeSpeaker} = useActiveSpeaker()

    const participantsLength = participants.length + 1
    const videoWidth = clsx([
        'w-[24%]',
        `${participantsLength === 1 ? 'w-[75%]' : ''}`,
        `${participantsLength === 2 ? 'w-[49%]' : ''}`,
        `${(participantsLength >= 3 && participantsLength <= 4) ? 'w-[37%]' : ''}`,
        `${(participantsLength >= 5 && participantsLength <= 9) ? 'w-[32%]' : ''}`,
    ])

    return (
        <RoomContainer>
            <PanelGroup direction={'vertical'} tw={"w-full h-full"}>
                <Panel defaultSize={90} tw={"w-full h-full"}>
                    <PanelGroup direction={'horizontal'} tw={"w-full h-full"}>
                        <Panel minSize={15} collapsible={true} className={`${!!screenSharer && 'grid grid-cols-5'} p-6 bg-primary1 gap-2`}>
                            <div className="flex flex-wrap justify-center w-full h-full gap-1 overflow-y-auto" ref={participantPanel}>
                                <div className="w-full">
                                    <div className="flex flex-wrap w-full h-full justify-center">
                                        {
                                            !!user && (
                                                <MediaStream
                                                    displayName={user.displayName}
                                                    mediaStream={user.mediaStream}
                                                    mediaState={user.mediaState()}
                                                    muted
                                                    activeSpeaker={isUser}
                                                    className={panelContainerSize <= 600 ? 'w-full' : videoWidth}
                                                />
                                            )
                                        }

                                        {
                                            participants.map(participant => (
                                                <MediaStream
                                                    displayName={participant.displayName}
                                                    mediaStream={participant.mediaStream}
                                                    mediaState={participant.mediaState()}
                                                    activeSpeaker={participant.id === activeSpeaker}
                                                    className={panelContainerSize <= 600 ? 'w-full' : videoWidth}
                                                />
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>

                            {
                                !!screenSharer && (
                                    <div
                                        className={"rounded-2xl col-span-4 w-full h-full overflow-hidden flex items-center"}>
                                        <div className="w-fit h-fit ">
                                            <ScreenShare mediaStream={screenSharer.mediaStream}/>
                                        </div>
                                    </div>
                                )
                            }

                        </Panel>
                        <VerticalPanelHandler/>
                        <MeetingNotes/>
                    </PanelGroup>
                </Panel>
                <HorizontalPanelHandler/>
                <Panel maxSize={10} defaultSize={10} collapsible={true} tw={"w-full h-full"}>
                    <Controls onMemoClick={setIsMemoShow}/>
                </Panel>
            </PanelGroup>
        </RoomContainer>
    )
}






















