import useStore from "./useStore";

const useActiveSpeaker = () => {
  const [user, activeSpeaker] = useStore(state => [state.user, state.activeSpeaker])
  return {
    isUser: user?.id === activeSpeaker && !!activeSpeaker,
    hasNoActiveSpeaker: activeSpeaker == null,
    activeSpeaker
  }
}

export default useActiveSpeaker
