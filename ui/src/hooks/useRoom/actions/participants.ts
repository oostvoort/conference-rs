import Participant from "../../../lib/MediasoupClient/Participant";
import {RoomParticipantsStore, RoomUserStore} from "../types";
import {MediaKind} from "mediasoup-client/lib/RtpParameters";
export const addProducer = (
  participantId: string,
  producerId: string,
  displayName: string,
  isShareScreen: boolean,
  isEnabled: boolean,
  track: MediaStreamTrack,
  state: RoomParticipantsStore
) => {
  const participant = new Participant(
    participantId,
    'current-room',
    displayName,
    isShareScreen
  )

  const index = state.participants.findIndex(({id}) => id === participantId)
  const currentParticipant = index > -1 ? state.participants[index].clone() : participant
  currentParticipant.addProducer(producerId, { track, isEnabled })


  if (isShareScreen) {
    return {
      screenSharers: [...state.screenSharers, participant]
    }
  }

  if (index > -1) {
    return {
      participants: state.participants.map((participant, currentIndex) => {
        if (currentIndex === index) return currentParticipant
        else return participant
      })
    }
  } else return {
    participants: [...state.participants, currentParticipant]
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
  const currentParticipant = state.participants[participantIndex].clone()
  if (currentParticipant.producersCount() < 2) {
    return {
      participants: state.participants.filter((_, index) => index !== participantIndex)
    }
  }
  currentParticipant.removeProducer(producerId)
  return {
    participants: state.participants.map(participant => {
      if (participant.id === currentParticipant.id) return currentParticipant
      else return participant
    })
  }
}

export const onToggleMedia = (participantId: string, isPlay: boolean, kind: MediaKind, state: RoomParticipantsStore) => {
  return {
    participants: state.participants.map(participant => {
      if (participant.id !== participantId) return participant
      const clonedParticipant = participant.clone()
      clonedParticipant.setPlayMedia(kind, isPlay)
      return participant
    })
  }
}