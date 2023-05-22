import {useParams} from "react-router-dom";
import useConfigStore from "../../config/store.ts";
import {Panel, PanelGroup} from "react-resizable-panels";
import React, {lazy, Suspense} from "react";
import {VerticalPanelHandler} from "../../components/shared/PanelBar/VerticalPanelHandler.tsx";
import {HorizontalPanelHandler} from "../../components/shared/PanelBar/HorizontalPanelHandler.tsx";
import 'twin.macro'
import {RoomContainer} from "./_room.comp.tsx";
import useJoinRoom from "../../hooks/useRoom/useJoinRoom";

const DynamicLoading = () => {
    return <>
        <div tw={"w-[100vw] h-[100vh] flex flex-col justify-center items-center"}><p className={"text-white"}>Loading
            ...</p></div>
        ,
    </>
}

const DynamicParticipants = lazy(() => import("../../components/shared/Participants"))
const DynamicMeetingNotes = lazy(() => import("../../components/pages/Room/MeetingNotes"))
const DynamicControls = lazy(() => import("../../components/pages/Room/Controls"))

export default function Room({isAudioOnly} : {isAudioOnly: boolean}) {
    const [, setIsMemoShow] = React.useState<boolean>(false)
    const {id} = useParams()

    const userName: string = useConfigStore(state => state.userName)

    const {mutate} = useJoinRoom(isAudioOnly)


    React.useEffect(() => {
        if (!id) return
        mutate({displayName: userName})
    }, [id, mutate, userName])

    return (
        <RoomContainer>
            <PanelGroup direction={'vertical'} tw={"w-full h-full"}>
                <Panel defaultSize={90} tw={"w-full h-full"}>
                    <PanelGroup direction={'horizontal'} tw={"w-full h-full"}>
                        <Suspense fallback={<DynamicLoading/>}>
                            <DynamicParticipants/>
                        </Suspense>
                        <VerticalPanelHandler/>
                        <Suspense fallback={<DynamicLoading/>}>
                            <DynamicMeetingNotes/>
                        </Suspense>
                    </PanelGroup>
                </Panel>
                <HorizontalPanelHandler/>
                <Panel maxSize={10} defaultSize={10} collapsible={true} tw={"w-full h-full"}>
                    <Suspense fallback={<DynamicLoading/>}>
                        <DynamicControls onMemoClick={setIsMemoShow}/>
                    </Suspense>
                </Panel>
            </PanelGroup>
        </RoomContainer>
    )
}