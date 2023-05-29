import React from "react";

export const ScreenShare = ({mediaStream}: {mediaStream: MediaStream}) => {
    const ref = React.useRef<HTMLVideoElement>(null)

    React.useEffect(() => {
        if (ref.current == null) return
        ref.current.srcObject = mediaStream
    }, [ref])

    return (
        <video
            autoPlay={true}
            playsInline={true}
            ref={ref}
            className={"video-element w-full h-full rounded-2xl"}
        />
    )
}