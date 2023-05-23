import { Device } from 'mediasoup-client'
import { ClientMessage, ConsumerId, ParticipantId, ServerMessage } from './'
import { Transport, TransportOptions } from 'mediasoup-client/lib/Transport'
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters'
import EventEmitter from 'events'
import { ENV, USER_MEDIA_CONSTRAINTS } from '../../config/config.ts'
import { ConsumerOptions } from 'mediasoup-client/lib/Consumer'
import Participant from './/Participant'

type ParticipantState = 'loading' | 'ready' | 'connected' | 'disconnected'
class OwnParticipant extends Participant {
  state: ParticipantState
  webSocket: WebSocket
  device: Device
  waitingForResponse: Map<ServerMessage['action'], (...args: any[]) => void> = new Map()
  sequentialMessages: Promise<void> = Promise.resolve()
  producerTransport: Transport | undefined
  consumerTransport: Transport | undefined
  mediaStream?: MediaStream

  eventEmitter: EventEmitter
  isAudioOnly: boolean

  constructor(
    id: string,
    roomId: string,
    displayName: string,
    isShareScreen: boolean,
    isAudioOnly = false
  ) {
    super(id, roomId, [], displayName, isShareScreen)
    this.state = 'loading'

    // this will help separate voice only rooms from audio and voice rooms
    const roomPrefix = isAudioOnly ? 'voice' : 'av'

    const wsUrl = new URL(`${ENV.SERVER_WS_ENDPOINT}/meet/${roomPrefix}-${roomId}`)
    if (displayName !== '') {
      wsUrl.searchParams.set('displayName', displayName)
      wsUrl.searchParams.set('isShareScreen', String(isShareScreen))
    }
    this.webSocket = new WebSocket(wsUrl)
    this.device = new Device()
    this.webSocket.onmessage = (message) => this.onWebSocketMessage(message)
    this.webSocket.onopen = () => this.state === 'ready'
    this.eventEmitter = new EventEmitter()
    this.isAudioOnly = isAudioOnly
  }

  async setMediaStream() {
    if (this.isShareScreen) {
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia()
    } else if (!this.isAudioOnly) {
      this.mediaStream = await navigator.mediaDevices.getUserMedia(USER_MEDIA_CONSTRAINTS)
    } else {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({audio: true})
    }
    this.eventEmitter.emit('mediaStreamSet')
  }

  onWebSocketMessage(message: MessageEvent) {
    // Blobs/binary are from ydoc, ignore them here
    if (message.data instanceof Blob) return

    const decodedMessage: ServerMessage = JSON.parse(message.data)

    // All other messages go here and are assumed to be notifications
    // that correspond to previously sent requests
    const callback = this.waitingForResponse.get(decodedMessage.action)

    if (callback) {
      this.waitingForResponse.delete(decodedMessage.action)
      callback(decodedMessage)
    } else {
      // Simple hack to make sure we process all messages in order, in real-world apps
      // messages it would be useful to have messages being processed concurrently
      this.sequentialMessages = this.sequentialMessages
        .then(() => {
          console.info('decoded messages: ', decodedMessage)
          // if (decodedMessage.action == 'Init') {
          //     return this.onServerMessage({..decodedMessage, mediaData = this.mediaData});
          // }
          return this.onServerMessage(decodedMessage)
        })
        .catch((error) => {
          console.error('Unexpected error during message handling:', error)
        })
    }
  }
  sendClientMessage(message: ClientMessage) {
    this.webSocket.send(JSON.stringify(message))
  }

  setId(id: string) {
    this.id = id
  }

  setDisplayName(displayName: string) {
    this.displayName = displayName
  }

  async initialize(
    participantId: ParticipantId,
    displayName: string,
    consumerTransportOptions: TransportOptions,
    producerTransportOptions: TransportOptions,
    routerRtpCapabilities: RtpCapabilities
  ) {
    this.setId(participantId)

    // if there was no display name given by the user, the server should have randomly created one
    if (!this.displayName) this.setDisplayName(displayName)

    // It is expected that server will send initialization message right after
    // WebSocket connection is established
    await this.device.load({
      routerRtpCapabilities: routerRtpCapabilities,
    })

    // Send client-side initialization message back right away
    this.sendClientMessage({
      action: 'Init',
      rtpCapabilities: this.device.rtpCapabilities,
    })

    // Producer transport is needed to send audio and video to SFU
    this.producerTransport = this.device.createSendTransport(
      producerTransportOptions,
    )

    this.producerTransport
      .on('connect', ({ dtlsParameters }, success) => {
        // Send request to establish producer transport connection
        this.sendClientMessage({
          action: 'ConnectProducerTransport',
          dtlsParameters,
        })
        // And wait for confirmation, but, obviously, no error handling,
        // which you should definitely have in real-world applications
        this.waitingForResponse.set('ConnectedProducerTransport', () => {
          success()
          console.info('Producer transport connected')
        })
      })
      .on('produce', ({
        kind,
        rtpParameters,
      }, success) => {
        // Once connection is established, send request to produce
        // audio or video track
        this.sendClientMessage({
          action: 'Produce',
          kind,
          rtpParameters,
        })
        // And wait for confirmation, but, obviously, no error handling,
        // which you should definitely have in real-world applications
        this.waitingForResponse.set('Produced', ({ id }: { id: string }) => {
          success({ id })
        })
      })

    // Request microphone and camera access, in real-world apps you may want
    // to do this separately so that audio-only and video-only cases are
    // handled nicely instead of failing completely

    await this.setMediaStream()
    // And create producers for all tracks that were previously requested
    for (const track of this.mediaStream!.getTracks()) {
      await this.producerTransport.produce({ track })
      // console.debug(`${track.kind} producer created:`, producer);
    }

    // Producer transport will be needed to receive produced tracks
    this.consumerTransport = this.device.createRecvTransport(
      consumerTransportOptions,
    )

    // If the first track were to stop, the websocket connection should be severed
    this.mediaStream!.getTracks()[0].onended = () => {
      this.leave()
    }

    this.consumerTransport
      .on('connect', ({ dtlsParameters }, success) => {
        // Send request to establish consumer transport connection
        this.sendClientMessage({
          action: 'ConnectConsumerTransport',
          dtlsParameters,
        })
        // And wait for confirmation, but, obviously, no error handling,
        // which you should definitely have in real-world applications
        this.waitingForResponse.set('ConnectedConsumerTransport', () => {
          success()
          console.debug('Consumer transport connected')
          this.state = 'connected'
        })
      })

      this.eventEmitter.emit('connected')
  }

  async onServerMessage(message: ServerMessage) {
    {
      switch(message.action) {
        case 'Init': {
          await this.initialize(
            message.participantId,
            message.displayName,
            message.consumerTransportOptions,
            message.producerTransportOptions,
            message.routerRtpCapabilities
          )
          break
        }
        case 'ProducerAdded': {
          /// this creates a consumer for every producer that exists in the room
          /// Not doing this for myScreenShare because it would be a waste to create more consumers
          if(!this.isShareScreen){
            await new Promise((resolve) => {
              // Send request to consume producer
              if (this.consumerTransport?.consume) {
                this.sendClientMessage({
                  action: 'Consume',
                  producerId: message.producerId,
                })
                // And wait for confirmation, but, obviously, no error handling,
                // which you should definitely have in real-world applications
                this.waitingForResponse.set('Consumed', async (consumerOptions: ConsumerOptions) => {
                  // Once confirmation is received, corresponding consumer
                  // can be created client-side
                  const consumer = await (this.consumerTransport as Transport).consume(
                    consumerOptions,
                  )
                  console.info(`${consumer.kind} consumer created:`, consumer)

                  // Consumer needs to be resumed after being created in
                  // paused state (see official documentation about why:
                  // https://mediasoup.org/documentation/v3/mediasoup/api/#transport-consume)
                  this.sendClientMessage({
                    action: 'ConsumerResume',
                    id: consumer.id as ConsumerId,
                  })
                  this.eventEmitter.emit(
                    'addProducer',
                    message.participantId,
                    message.producerId,
                    message.displayName,
                    message.isShareScreen,
                    message.isEnabled,
                    consumer.track
                  )
                  resolve(undefined)
                })
              }
            })
          }
          break
        }
        case 'ProducerRemoved': {
          this.eventEmitter.emit('removeProducer', message.participantId, message.producerId)
          break
        }
        case 'ToggleMedia': {
          this.eventEmitter.emit('toggleMedia', message.participantId, message.isPlay, message.kind)
          break
        }
        case 'BroadcastAction': {
          this.eventEmitter.emit('actionBroadcast', message.kind, message.from)
          break
        }
        default: {
          console.error('Received unexpected message', message)
        }
      }
    }
  }

  stopTracks() {
    if(this.mediaStream) {
      for(const track of this.mediaStream.getTracks()) {
        track.stop()
      }
    }
  }

  leave() {
    this.webSocket.close()
    this.eventEmitter.emit('disconnected')
  }
}

export default OwnParticipant


