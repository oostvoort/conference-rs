import { MediaKind } from 'mediasoup-client/lib/RtpParameters'

class Participant {
  id: string
  roomId: string
  producers: { [kind: MediaKind]: string }
  displayName: string
  isShareScreen: boolean
  mediaStream: MediaStream

  constructor(id: string, roomId: string, displayName: string, isShareScreen: boolean, producers?: { [kind: MediaKind]: string }) {
    this.id = id
    this.roomId = roomId
    this.displayName = displayName
    this.isShareScreen = isShareScreen
    this.mediaStream = new MediaStream()
    this.producers = producers ?? {
      audio: '',
      video: ''
    }
  }

  addProducer(producerId: string, { track, kind, isEnabled }: {track?: MediaStreamTrack, kind?: MediaKind, isEnabled?: boolean }) {
    const mediaKind = kind ?? track?.kind
    if (mediaKind) this.producers[mediaKind] = producerId
    if (track) {
      if (isEnabled !== undefined) track.enabled = isEnabled
      this.mediaStream.addTrack(track)
    }
  }

  setPlayMedia(kind: MediaKind, isEnabled: boolean) {
    const track = this.getTrackByKind(kind)
    if(track) {
      track.enabled = isEnabled
    }
  }
  removeProducer(producerId: string) {
    const kind = this.getKindByProducerId(producerId)
    this.producers[kind] = ''
    const track = this.getTrackByKind(kind)
    if(track) this.mediaStream.removeTrack(track)
  }

  mediaState() {
    return {
      audio: this.getTrackByKind('audio')?.enabled,
      video: this.getTrackByKind('video')?.enabled
    }
  }
  getKindByProducerId(id: string) {
    for (const [kind, producerId] of Object.entries(this.producers)) {
      if (id === producerId) return kind as MediaKind
    }
    throw new Error('Producer ID not found')
  }

  getTrackByKind(kind: MediaKind) {
    for (const track of this.mediaStream.getTracks()) {
      if(track.kind === kind) return track
    }
    return null
  }

  producersCount () {
    const activeProducers = Object.values(this.producers).filter(value => !!value)
    return activeProducers.length
  }

  clone () {
    const participant = new Participant(this.id, this.roomId, this.displayName, this.isShareScreen)
    for (const [kind, producerId] of Object.entries(this.producers)) {
      const track = this.getTrackByKind(kind as MediaKind) ?? undefined
      participant.addProducer(producerId, { track, kind: kind as MediaKind })
    }
    return participant
  }
}

export default Participant
