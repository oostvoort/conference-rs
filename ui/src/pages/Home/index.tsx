import Video from "../../components/pages/Home/Video.tsx";
import React from "react";
import useConfigStore from "../../config/store.ts";
import {useNavigate} from "react-router-dom";
import {Audio} from "../../components/pages/Home/Audio.tsx";
import useRoomStateStore from "../../config/useRoomStateStore.ts";
import clsx from "clsx";

export default function Home() {
    const { roomId, onlyVoice, setRoomId, setOnlyVoice } = useRoomStateStore()
    const updateUserName = useConfigStore(state => state.updateUserName)
    const [ username, setUsername ] = React.useState<string>('')

    const push = useNavigate()

    function handleJoinRoom() {
        updateUserName(username)
        push(`/${!onlyVoice ? 'room' : 'voice' }/${roomId}`)
    }

    return (
        <div className={'w-full h-[100vh] bg-primary2 flex justify-center items-center'}>
            <div className={'flex w-[84.3em] h-9/12 bg-white p-8 rounded-xl gap-x-5 '}>
                <div className={'w-8/12 h-full'}>
                    <div className={"flex justify-between items-start mb-1"}>
                        <div className={"space-x-1"}>
                            <span className={"font-semibold text-gray-700 text-sm tracking-wide"}>Connection Status: </span>
                            <span className={`font-semibold text-sm tracking-wide`}>4G</span>
                        </div>
                        <div className={"space-x-1"}>
                            <span className={"font-semibold text-gray-700 text-sm tracking-wide"}>Ping: </span>
                            <span className={`font-semibold text-sm tracking-wide`}>1ms</span>
                        </div>
                    </div>
                    <div className={'h-full bg-black rounded-xl overflow-hidden'}>

                        {
                            onlyVoice ? (
                                <Audio/>
                            ) : (
                                <Video/>
                            )
                        }
                    </div>
                </div>
                <div className={'w-4/12'}>
                    <div className={'flex flex-col h-full justify-between items-center pt-10'}>
                        <img src={'/assets/ov_conf_logo.png'} alt={'OV'} width={295} height={56}/>
                        <div className={'w-full px-8'}>
                            <form className={'flex gap-1 flex-col'} onSubmit={handleJoinRoom}>
                                <input
                                    type={'text'}
                                    placeholder={'Username'}
                                    className={clsx([
                                        'w-full my-1 p-4',
                                        'text-secondary1 text-sm font-montserrat font-semibold',
                                        'bg-secondary2 placeholder-secondary1 rounded-lg',
                                        'focus:outline-none focus:border-2 focus:border-green-500'
                                    ])}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required={true}
                                />
                                <input
                                    type={'number'}
                                    placeholder={'Meeting ID'}
                                    className={clsx([
                                        'w-full my-1 p-4',
                                        'text-secondary1 text-sm font-montserrat font-semibold',
                                        'bg-secondary2 placeholder-secondary1 rounded-lg',
                                        'focus:outline-none focus:border-2 focus:border-green-500'
                                    ])}
                                    value={roomId <= 0 ? '' : roomId}
                                    onChange={(value) => setRoomId(Number(value.currentTarget.value))}
                                    required={true}
                                />
                                <label className="flex items-center w-full mb-8 my-1 ">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 accent-green-600 text-green-500 cursor-pointer"
                                        onChange={() => setOnlyVoice(!onlyVoice)} checked={onlyVoice}
                                    />
                                    <span className="ml-2 text-primary4 text-sm font-montserrat font-semibold">Voice Only</span>
                                </label>

                                <button
                                    type={'submit'}
                                    className={clsx([
                                        'w-full py-4 bg-secondary1',
                                        'text-white text-sm font-montserrat font-semibold',
                                        'rounded rounded-lg hover:bg-green-700',
                                    ])}
                                >
                                    Join Meeting
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
