export const USER_MEDIA_CONSTRAINTS = {
    audio: true,
    video: {
        width: {
            ideal: 1280
        },
        height: {
            ideal: 720
        },
        frameRate: {
            ideal: 30
        }
    }
};

const prodWsUrl = () => {
    const protocol = window.location.protocol
    const wsProtocol = protocol.replace("http", "ws")
    const baseUrl = window.location.host
    return `${wsProtocol}/${baseUrl}`
}

export const ENV = {
    SERVER_WS_ENDPOINT: (import.meta.env.DEV ? import.meta.env.VITE_WS_URL : prodWsUrl()) + '/api',
}

export const SOUND_SRC = {
    applause: '/assets/sounds/applause.ee04344c.ogg',
    celebrate: '/assets/sounds/celebrate.aee4263b.ogg'
}