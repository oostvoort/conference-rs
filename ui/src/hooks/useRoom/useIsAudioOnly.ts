const useIsAudioOnly = () => {
  /// for now, checking if the room is a voice room is based on pathName
  return window.location.pathname.includes('voice')
}

export default useIsAudioOnly