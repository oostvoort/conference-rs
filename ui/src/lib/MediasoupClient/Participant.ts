import { MediaKind } from 'mediasoup-client/lib/RtpParameters'
import Producer from './/Producer'

class Participant {
  id: string
  roomId: string
  producers: Producer[]
  displayName: string
  isShareScreen: boolean

  constructor(id: string, roomId: string, producers: Producer[], displayName: string, isShareScreen: boolean) {
    this.id = id
    this.roomId = roomId
    this.producers = producers
    this.displayName = displayName
    this.isShareScreen = isShareScreen
  }

  addProducer(producerId: string, track: MediaStreamTrack) {
    this.producers = [...this.producers, new Producer(producerId, track)]
  }

  setPlayMedia(kind: MediaKind, isEnabled: boolean) {
    this.producers.forEach(producer => {
      if(producer.track.kind === kind) producer.setPlayTrack(isEnabled)
    })
  }
  removeProducer(producerId: string) {
    this.producers = this.producers.filter(producer => producer.id !== producerId)
  }

  mediaState() {
    const mediaState: { audio: null | boolean, video: null | boolean } = {
      audio: null,
      video: null
    }
    for (const producer of this.producers) {
      if (producer.kind() === 'audio') mediaState["audio"] = producer.isTrackEnabled()
      else if (producer.kind() === 'video') mediaState["video"] = producer.isTrackEnabled()
    }
    return mediaState
  }

  mediaStreamTracks() {
    return this.producers.map(({ track }) => track)
  }
}

export default Participant
