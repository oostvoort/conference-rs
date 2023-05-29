import {useParams} from "react-router-dom";
import useConfigStore from "../../config/store.ts";
import React from "react";
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

export default function TestRoom({isAudioOnly}: { isAudioOnly: boolean }) {
    const [, setIsMemoShow] = React.useState<boolean>(false)
    const {id} = useParams()

    const userName: string = useConfigStore(state => state.userName)

    const {mutate} = useJoinRoom(isAudioOnly)

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
        mutate({displayName: userName})
    }, [id, mutate, userName])


    const { isUser, activeSpeaker} = useActiveSpeaker()

    return (
        <RoomContainer>
            <PanelGroup direction={'vertical'} tw={"w-full h-full"}>
                <Panel defaultSize={90} tw={"w-full h-full"}>
                    <PanelGroup direction={'horizontal'} tw={"w-full h-full"}>
                        <Panel minSize={15} collapsible={true} className={`${!!screenSharer && 'grid grid-cols-5'} p-6 bg-primary1 gap-2`}>
                            <div className="flex flex-wrap justify-center w-full h-full gap-1 overflow-y-scroll overflow-x-hidden">
                                <div className="container">
                                    <div className="flex flex-wrap w-full h-full justify-center">
                                        {
                                            !!user && (
                                                <MediaStream
                                                    displayName={user.displayName}
                                                    mediaStream={user.mediaStream}
                                                    mediaState={user.mediaState()}
                                                    muted
                                                    activeSpeaker={isUser}
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






















