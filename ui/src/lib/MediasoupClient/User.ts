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
    const track = this.getTrackByKind(kind)
    if (track) track.enabled = !track.enabled
    this.sendClientMessage({ action: 'ToggleMedia', kind})
  }

  broadcastAction(kind: string) {
    this.sendClientMessage({ action: 'BroadcastAction', kind })
  }
}

export default User
