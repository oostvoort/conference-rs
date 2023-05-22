import OwnParticipant from './/OwnParticipant'

class ScreenShare extends OwnParticipant {
  constructor(
    roomId: string,
    baseName = '',
    isAudioOnly = false
  ) {
    const displayName = baseName ? `${baseName}-ScreenShare` : 'ScreenShare'
    super('ScreenShare', roomId, displayName, true, isAudioOnly)
  }
  stop () {
    this.stopTracks()
    this.leave()
  }
}
export default ScreenShare
