import React from "react";

export const Audio = () => {
    const audioRef = React.useRef<HTMLAudioElement>(null)
    const getAudio = () => {
        navigator.mediaDevices
            .getUserMedia({audio: true, video: false})
            .then(stream => {
                const audio = audioRef.current

                if (audio !== null) {
                    audio.srcObject = stream
                    audio.play()
                }
            }).catch(e => {
            console.error("Error: ", e)
        })
    }

    React.useEffect(() => {
        getAudio()
    }, [audioRef])

    return (
        <div className="relative">
            <div className={'w-[890px] h-[500px] bg-black rounded-lg flex justify-center items-center'}>
                <img src="/assets/icon_screen_off.svg" alt=""/>
            </div>
            <audio className="w-full h-12 mt-2" controls={false} ref={audioRef}/>
        </div>
    )
}