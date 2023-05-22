// @ts-ignore
import React, {useState} from "react";
import 'twin.macro'
import {Celebrate} from "../../../shared/EmojiEffect/Celebrate.tsx";
import {createPortal} from "react-dom";
import useStore from "../../../../hooks/useRoom/useStore.ts";

export const Emoji = () => {
    const user = useStore(state => state.user)

    const handleCelebrate = () => {
        user?.broadcastAction('Celebrate')
    }

    const handleApplause = () => {
        user?.broadcastAction('Applause')
    }

    return (
        <>
            <div tw={"flex justify-center items-center border-[1px] border-black rounded py-1.5 px-1.5"}>
                <button onClick={handleCelebrate} tw={"text-2xl py-2 px-5 hover:bg-gray-500 rounded transition ease-in-out duration-300 hover:-translate-y-1 hover:scale-125"}>
                    🎉
                </button>
                <button onClick={handleApplause}
                    tw={"text-2xl py-2 px-5 hover:bg-gray-500 rounded transition ease-in-out duration-300 hover:-translate-y-1 hover:scale-125"}>
                    👏
                </button>
            </div>
            {
                createPortal(
                    <Celebrate />,
                    document.body
                )
            }
        </>
    )
}