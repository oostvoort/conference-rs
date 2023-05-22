
import React from 'react'
import useMeetingNotesStore from '../../../../config/useMeetingNotesStore'

interface ResizableDiv extends HTMLDivElement {
  resize: (size: number) => void
}

type TeamMemoProps = {
  onMemoClick: React.Dispatch<React.SetStateAction<boolean>>
}

export const TeamMemo = ({onMemoClick} : TeamMemoProps) => {
  const memoRef = useMeetingNotesStore((state) => state.meetingNotesRef)
  const memoSize = useMeetingNotesStore((state) => state.meetingNotesSize)

  const handleMeetingNotes = () => {
    if (memoSize !== 0 && memoRef !== null) {
      (memoRef.current as ResizableDiv)?.resize(0)
      onMemoClick(false)
    } else if (memoRef !== null) {
      (memoRef.current as ResizableDiv)?.resize(30)
      onMemoClick(true)
    }
  }

  return (
    <button onClick={handleMeetingNotes} className={'flex gap-4 p-3 hover:bg-gray-500 hover:rounded rounded transition east-out duration-500'}>
      <img src={`${memoSize === 0 ? '/assets/icon_teamMemo_default.svg' : '/assets/icon_teamMemo_active.svg'}`}
             alt={'Meeting Notes'} width={35} height={35} />
      <p className={`my-auto text-sm ${memoSize === 0 ? 'text-white' : 'text-secondary1'}`}>Team Memo</p>
    </button>
  )
}
