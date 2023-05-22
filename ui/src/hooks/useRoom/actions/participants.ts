import Producer from "../../../lib/MediasoupClient/Producer";
import Participant from "../../../lib/MediasoupClient/Participant";
import {RoomParticipantsStore, RoomUserStore} from "../types";
import {MediaKind} from "mediasoup-client/lib/RtpParameters";
export const addProducer = (participantId: string, producerId: string, displayName: string, isShareScreen: boolean, track: MediaStreamTrack, state: RoomParticipantsStore) => {
  const producer = new Producer(producerId, track)
  const participant = new Participant(participantId, 'current-room', [producer], displayName, isShareScreen)

  if (isShareScreen) {
    return {
      screenSharers: [...state.screenSharers, participant]
    }
  }

  const index = state.participants.findIndex(({id}) => id === participantId)
  if (index > -1) state.participants[index].addProducer(producerId, track)
  else return {
    participants: [...state.participants, participant]
  }

  return {
    participants: state.participants
  }
}

export const removeProducer = (participantId: string, producerId: string, state: RoomUserStore & RoomParticipantsStore) => {
  if (state.myScreenShare?.id === participantId) state?.myScreenShare.stop()

  const screenShareIndex = state.screenSharers.findIndex(({id}) => id === participantId)
  if (screenShareIndex > -1) {
    return {
      myScreenShare: state.myScreenShare?.id === participantId ? undefined : state.myScreenShare,
      screenSharers: state.screenSharers.filter((_, index) => index !== screenShareIndex)
    }
  }

  const participantIndex = state.participants.findIndex(({id}) => id === participantId)
  if (participantIndex === -1) return state
  if (state.participants[participantIndex].producers.length < 2) {
    return {
      participants: state.participants.filter((_, index) => index !== participantIndex)
    }
  }
  state.participants[participantIndex].removeProducer(producerId)
  return {
    participants: state.participants
  }
}

export const onToggleMedia = (participantId: string, isPlay: boolean, kind: MediaKind, state: RoomParticipantsStore) => {
  return {
    participants: state.participants.map(participant => {
      if (participant.id !== participantId) return participant
      participant.setPlayMedia(kind, isPlay)
      return participant
    })
  }
}