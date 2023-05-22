import useConfigStore from "../../../config/store.ts";
import React from "react";
import {useNavigate} from "react-router-dom";

export default function Form() {
    const updateUserName = useConfigStore(state => state.updateUserName)
    const [ username, setUsername ] = React.useState<string>('')
    const [ roomId, setRoomId ] = React.useState<number>(0)

    const push = useNavigate()

    function handleJoinRoom() {
        updateUserName(username)
        push(`/room/${roomId}`)
    }

    return (
        <form className={'flex gap-1 flex-col'}>
            <input
                type={'text'}
                placeholder={'Username'}
                className={'w-full my-1 p-4 text-secondary1 text-sm font-semibold rounded-lg bg-secondary2 placeholder-secondary1 ' +
                    'focus:outline-none focus:border-2 focus:border-green-500'}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type={'text'}
                placeholder={'Meeting ID'}
                className={'w-full my-1 p-4 text-secondary1 text-sm font-semibold rounded-lg bg-secondary2 placeholder-secondary1 ' +
                    'focus:outline-none focus:border-2 focus:border-green-500'}
                onChange={(value) => setRoomId(Number(value.currentTarget.value))}
            />
            <label className="flex items-center w-full mb-8 my-1 ">
                <input type="checkbox"
                       className="form-checkbox h-5 w-5  accent-green-600 text-green-500"/>
                    <span className="ml-2 text-gray-700">Voice Only</span>
            </label>

            <button
                type={'button'}
                className={'w-full py-4 bg-secondary1 text-white rounded text-sm font-semibold rounded-lg hover:bg-green-700'}
                onClick={handleJoinRoom}
            >
                Join Meeting
            </button>
        </form>
    )
}