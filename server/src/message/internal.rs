use mediasoup::consumer::Consumer;
use mediasoup::prelude::Producer;

/// Internal actor messages for convenience
pub enum InternalMessage {
    /// Save producer in connection-specific hashmap to prevent it from being destroyed
    SaveProducer(Producer),
    
    /// Save consumer in connection-specific hashmap to prevent it from being destroyed
    SaveConsumer(Consumer),
    
    /// Stop/close the WebSocket connection
    Stop,
}
