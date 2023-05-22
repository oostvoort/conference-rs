import React from "react";

export default function MediaStream(props: {mediaStream: MediaStream}) {
    const videoRef = React.useRef<HTMLVideoElement>(null)

    React.useEffect(() => {
        if (!videoRef.current) return
        videoRef.current.srcObject = props.mediaStream
    }, [props.mediaStream])

    return (
        <video
            autoPlay={true}
            controls={false}
            playsInline={true}
            className={"bg-primary3 w-full h-full rounded-xl"}
            ref={videoRef}
        />
    );
}