![](https://raw.githubusercontent.com/oostvoort/conference-rs/main/ov_conf_logo.png)

# Conference-RS
An open-sourced video-calling tool. It's comprised of a Vite React WebApp supported by a
backend written in Rust that is based on [MediaSoup's Architecture](https://mediasoup.org/documentation/v3/mediasoup/design/) 
to handle video-conferencing. 

There are two main folders in this repo: server and ui. The server folder houses all the Rust 
code. It is intended as a backend service with the capability to create rooms as requested and 
allow users to join rooms for video/audio conferencing. Using reference counting pointers, it 
is able to keep track of opened rooms and their participants. Using the axum crate, the server 
code also serves up the frontend code.

The ui folder includes all frontend code served in the client. It is written in Vite React.

# Features
1. Video-conferencing
2. Audio only conferencing
3. Shared Notes within a Room
4. Screen Sharing
5. Broadcasting Actions to other participants in a Room
   * Applause - Sounds of applause are played in a Room briefly
   * Celebrate - Sounds of celebration are played in a Room briefly accompanied by confetti

# Setting up
There are two ways to set up Conference-RS:

## Using Docker Compose (Recommended)

### Prerequisites
1. [Docker](https://docs.docker.com/get-docker/)
2. [Docker Compose Plugin](https://docs.docker.com/compose/install/)

### Environment Variables
There are several environment variables that can be set for the container.
1. SERVER_PORT - the port the server is hosted (defaults to 3000)
2. RTC_PORT_RANGE_START - the starting port from which the RTCs will generate from (defaults to 40000)
3. RTC_PORT_RANGE_END - the last port from which the RTCs will generate from (defaults to 40050)
4. WEBRTC_LISTEN_IP - IP Address to listen for (defaults to 127.0.0.1)
5. WEBRTC_ANNOUNCED_IP- IP Address the Conference can be found in (defaults to 127.0.0.1)
6. RUST_LOG - Level of logging to display in the Rust Code

#### Take Note
If hosting this image in production, the ports from the RTC_PORT_RANGE_START through the RTC_PORT_RANGE_END 
have to be opened up. The server needs them opened to be able to serve up RTCs.

### Setup
````shell
docker compose up -d
````

## Running Locally

### Prerequisites
1. [NodeJS](https://nodejs.org/en/download)
2. [Rust](https://doc.rust-lang.org/book/ch01-01-installation.html)
3. [Net-Tools](https://howtoinstall.co/en/net-tools)
4. [Build-Essential](https://linuxhint.com/install-build-essential-ubuntu/)
5. [Python](https://www.python.org/downloads/)
6. [Valgrind](https://valgrind.org/downloads/?src=www.discoversdk.com)

### Setup
1. Running the frontend (using yarn)
````shell
cd ui
cp .env.example .env
yarn install
yarn dev
````
2. Running the backend
````shell
cd server
cargo run
````

# Additional Resources
- [GitHub Repository](https://github.com/oostvoort/conference-rs)
- [Mediasoup Rust](https://docs.rs/mediasoup/latest/mediasoup/)
  - [MediaSoup producers, consumers, routers](https://mediasoup.org/documentation/v3/mediasoup/design/)
- Reference counting pointers (e.g. Rc and Arc)
  - [Arc Struct](https://doc.rust-lang.org/std/sync/struct.Arc.html)  
  - [Youtube Tutorial](https://www.youtube.com/watch?v=CTTiaOo4cbY)
- [Mutex](https://doc.rust-lang.org/std/sync/struct.Mutex.html)
- [HashMaps](https://doc.rust-lang.org/std/collections/struct.HashMap.html)
- [Move](https://doc.rust-lang.org/std/keyword.move.html)

 
