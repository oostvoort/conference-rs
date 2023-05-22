import useShareScreen from "../../../../hooks/useRoom/useShareScreen";
import useStore from "../../../../hooks/useRoom/useStore";
import clsx from "clsx";

export const ScreenShare = () => {
  const shareScreen = useShareScreen()

  const [myScreenShare, screenSharers, stopShareScreen] =
    useStore(state => [state.myScreenShare, state.screenSharers, state.stopShareScreen])

  const isScreenSharer = !!myScreenShare
  const isOtherScreenSharing = !isScreenSharer && !!screenSharers.length
  const hasNoScreenSharer = !myScreenShare && !screenSharers.length

  function handleClick() {
    if (isScreenSharer) stopShareScreen()
    else shareScreen.mutate()
  }

  const buttonText = isOtherScreenSharing ? 'Takeover Screen' : isScreenSharer ? 'Stop Share Screen' : 'Share Screen'

  return (
    <button onClick={handleClick} className={'flex gap-4 p-3 hover:bg-gray-500 hover:rounded rounded transition ease-out duration-500'}>
      <img src={'/assets/icon_screenshare_default.svg'} alt={buttonText} width={35} height={35}/>
      <p className={clsx([
        'my-auto text-sm',
        {'text-white': hasNoScreenSharer },
        {'text-red-500': isScreenSharer },
        {'text-orange-400': isOtherScreenSharing}
      ])}>
        { buttonText }
      </p>
    </button>
  )
}

export default ScreenShare