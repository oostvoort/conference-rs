import { MediaKind } from 'mediasoup-client/lib/RtpParameters'
import OwnParticipant from './/OwnParticipant'

class User extends OwnParticipant {
  constructor(
    roomId: string,
    displayName: string,
    isAudioOnly: boolean
  ) {
    super('User', roomId, displayName, false, isAudioOnly)
  }

  toggleMedia(kind: MediaKind) {
    if (this.mediaStream) {
      if (kind === 'audio') {
        const isEnabled = this.mediaStream.getAudioTracks()[0].enabled
        this.mediaStream.getAudioTracks()[0].enabled = !isEnabled
      } else {
        const isEnabled = this.mediaStream.getVideoTracks()[0].enabled
        this.mediaStream.getVideoTracks()[0].enabled = !isEnabled
      }
    }
    this.sendClientMessage({ action: 'ToggleMedia', kind})
  }

  broadcastAction(kind: string) {
    this.sendClientMessage({ action: 'BroadcastAction', kind })
  }
}

export default User
