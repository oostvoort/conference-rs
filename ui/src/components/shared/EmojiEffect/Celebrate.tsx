import useWindowSize from "../../../hooks/useWIndowSize.tsx";
import Confetti from "react-confetti";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, {useEffect} from "react";
import useEmojiStore from "../../../hooks/useRoom/useEmojiStore.ts";
import {SOUND_SRC} from "../../../config/config";

export const Celebrate = () => {
    const { width, height } = useWindowSize()

    const [celebrate, deactivate] = useEmojiStore(state => [
        state.celebrate, state.deactivate
    ])

    useEffect(() => {
        if (celebrate) {
           new Audio(SOUND_SRC.celebrate).play().then(r => r).catch(e => console.error("ERROR: ", e))
        }
    }, [celebrate])

    return (
        <Confetti
            width={width}
            height={height}
            numberOfPieces={celebrate ? 2000 : 0}
            initialVelocityY={20}
            initialVelocityX={5}
            gravity={0.06}
            run={true}
            recycle={false}
            onConfettiComplete={confetti => {
                deactivate()
                confetti?.reset()

            }}
        />
    )
}