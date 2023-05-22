// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react'
import {VideoControls} from './VideoControls.tsx'
import {TeamMemo} from './TeamMemo'
import "twin.macro"
import {Emoji} from "./Emoji.tsx";
import ScreenShare from "./ScreenShare";

const Controls = ({onMemoClick}: {onMemoClick: React.Dispatch<React.SetStateAction<boolean>>}) => {
    return (
        <div tw={'h-full flex justify-between items-center bg-primary1 py-2 px-4'}>
            <ScreenShare />
            <div tw={"flex justify-center items-center gap-x-2"}>
                <VideoControls/>
                <Emoji/>
            </div>
            <TeamMemo onMemoClick={onMemoClick}/>
        </div>
    )
}

export default Controls