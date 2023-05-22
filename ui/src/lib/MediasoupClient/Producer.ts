class Producer {
  id: string
  track: MediaStreamTrack
  constructor(id: string, track: MediaStreamTrack) {
    this.id = id
    this.track = track
  }

  setPlayTrack(isEnabled: boolean) {
    this.track.enabled = isEnabled
  }

  isTrackEnabled() {
    return this.track.enabled
  }

  kind() {
    return this.track.kind
  }

}

export default Producer
