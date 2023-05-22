import {DtlsParameters, TransportOptions} from "mediasoup-client/lib/Transport";
import {MediaKind, RtpCapabilities, RtpParameters} from "mediasoup-client/lib/RtpParameters";

export type Brand<K, T> = K & { __brand: T };

export type RoomId = Brand<string, 'RoomId'>;
export type ParticipantId = Brand<string, 'ParticipantId'>;
export type ConsumerId = Brand<string, 'ConsumerId'>;
export type ProducerId = Brand<string, 'ProducerId'>;

export interface ServerInit {
    action: 'Init';
    displayName: string;
    roomId: RoomId;
    isShareScreen: boolean;
    consumerTransportOptions: TransportOptions;
    participantId: ParticipantId;
    producerTransportOptions: TransportOptions;
    routerRtpCapabilities: RtpCapabilities;
    mediaData: MediaStream;
}

export interface ServerProducerAdded {
    action: 'ProducerAdded';
    participantId: ParticipantId;
    displayName: string;
    isShareScreen: boolean;
    isEnabled: boolean;
    producerId: ProducerId;
}

export interface ServerProducerRemoved {
    action: 'ProducerRemoved';
    participantId: ParticipantId;
    producerId: ProducerId;
    isShareScreen: boolean;
}

export interface ServerConnectedProducerTransport {
    action: 'ConnectedProducerTransport';
}

export interface ServerProduced {
    action: 'Produced';
    id: ProducerId;
}

export interface ServerConnectedConsumerTransport {
    action: 'ConnectedConsumerTransport';
}

export interface ServerConsumed {
    action: 'Consumed';
    id: ConsumerId;
    kind: MediaKind;
    rtpParameters: RtpParameters;
}

export interface ServerToggleMedia {
  action: 'ToggleMedia';
  participantId: ParticipantId;
  kind: MediaKind;
  isPlay: boolean;
}
export interface ServerBroadcastAction {
  action: 'BroadcastAction',
  kind: string,
  from: ParticipantId
}

export type ServerMessage =
    ServerInit |
    ServerProducerAdded |
    ServerProducerRemoved |
    ServerConnectedProducerTransport |
    ServerProduced |
    ServerConnectedConsumerTransport |
    ServerConsumed |
    ServerToggleMedia |
    ServerBroadcastAction;

export interface ClientInit {
    action: 'Init';
    rtpCapabilities: RtpCapabilities;
}

export interface ClientConnectProducerTransport {
    action: 'ConnectProducerTransport';
    dtlsParameters: DtlsParameters;
}

export interface ClientConnectConsumerTransport {
    action: 'ConnectConsumerTransport';
    dtlsParameters: DtlsParameters;
}

export interface ClientProduce {
    action: 'Produce';
    kind: MediaKind;
    rtpParameters: RtpParameters;
}

export interface ClientConsume {
    action: 'Consume';
    producerId: ProducerId;
}

export interface ClientConsumerResume {
    action: 'ConsumerResume';
    id: ConsumerId;
}

export interface ClientToggleMedia {
  action: 'ToggleMedia',
  kind: MediaKind
}

export interface ClientBroadcastAction {
  action: 'BroadcastAction',
  kind: string

}

export type ClientMessage =
    ClientInit |
    ClientConnectProducerTransport |
    ClientProduce |
    ClientConnectConsumerTransport |
    ClientConsume |
    ClientConsumerResume |
    ClientToggleMedia |
    ClientBroadcastAction;
