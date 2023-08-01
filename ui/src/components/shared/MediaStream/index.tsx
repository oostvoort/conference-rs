import React from "react";
import {MediaKind} from "mediasoup-client/lib/RtpParameters";
import clsx from "clsx";

type MediaState = {
    [p in MediaKind]: undefined | boolean
}

type PropsType = {
    mediaStream: MediaStream,
    displayName: string,
    mediaState: MediaState,
    autoplay?: boolean,
    muted?: boolean,
    activeSpeaker?: boolean,
    className?: string,
}

import {motion} from "framer-motion";
const Audio = ({mediaStream, muted}: { mediaStream: MediaStream, muted: boolean }) => {
    const ref = React.useRef<HTMLVideoElement>(null)

    React.useEffect(() => {
        if (ref.current == null) return
        ref.current.srcObject = mediaStream
    }, [ref])
    return (
        <React.Fragment>
            <div className={'w-full h-full rounded-lg flex justify-center items-center overflow-hidden'}>
                <motion.div
                    initial={{ scale: 5 }}
                    animate={{ rotate: 360, scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 25
                    }}
                >
                    <img src="/assets/icon_screen_off.svg" alt=""/>
                </motion.div>
            </div>
            <audio
                autoPlay={true}
                playsInline={true}
                ref={ref}
                muted={muted}
            />
        </React.Fragment>
    )
}

const Video = ({mediaStream, muted}: { mediaStream: MediaStream, muted: boolean }) => {
    const ref = React.useRef<HTMLVideoElement>(null)

    React.useEffect(() => {
        if (ref.current == null) return
        ref.current.srcObject = mediaStream
    }, [ref])

    return (
        <video
            autoPlay={true}
            controls={false}
            playsInline={true}
            ref={ref}
            className={"video-element"}
            muted={muted}
        />
    )
}


export const MediaStream: React.FunctionComponent<PropsType> = ({mediaStream,mediaState, displayName, muted = false, activeSpeaker = false, className }) => {
    const isShowAudio = !mediaState.video

    return (
        <div className={clsx([
            'flexing-rectangle self-center aspect-video m-1 relative rounded-2xl overflow-auto',
            `${className}`,
            {'border-4 border-secondary1 divide-solid': activeSpeaker}
        ])}>
            <div className="video-wrapper bg-primary3 ">
                {
                    isShowAudio ? (
                        <Audio
                            mediaStream={mediaStream}
                            muted={muted}
                        />
                    ) : (
                        <Video
                            mediaStream={mediaStream}
                            muted={muted}
                        />
                    )
                }
            </div>

            <span className={"flex gap-1 bg-black text-white pl-2 pr-2 pt-1 pb-1 rounded-xl absolute bottom-2 left-2"}>
                {
                    !mediaState.audio ? (
                        <img src={'/assets/icon_mic_off.svg'}
                             alt={'Screen share'} width={20}
                             height={35}/>
                    ) : <></>
                }
                {displayName}
            </span>
        </div>
    )
}










