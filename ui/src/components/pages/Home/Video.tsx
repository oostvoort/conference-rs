
import React from 'react'
import {USER_MEDIA_CONSTRAINTS} from "../../../config/config.ts";
export default function Video() {
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const getVideo = () => {
        navigator.mediaDevices
            .getUserMedia(USER_MEDIA_CONSTRAINTS)
            .then(stream => {
                const video = videoRef.current

                if (video !== null) {
                    video.srcObject = stream
                    video.play()
                }
            }).catch(e => {
            console.error("Error: ", e)
        })
    }

    React.useEffect(() => {
        getVideo()
    }, [ videoRef ])

    return (
        <video
            autoPlay={true}
            controls={false}
            playsInline={true}
            width={900}
            className={"drop-shadow-2xl rounded-xl"}
            ref={videoRef}
        />
    )

}