'use client'

import React from 'react'
import { Panel } from 'react-resizable-panels'
import SimpleBar from 'simplebar-react'
import useMeetingNotesStore from '../../../../config/useMeetingNotesStore.ts'
import MeetingNotesComponents from './MeetingNotes.tsx'
import 'simplebar-react/dist/simplebar.min.css';

const MeetingNotes = () => {
  const setMemoRef = useMeetingNotesStore((state) => state.setMeetingNotesRef)
  const setMemoSize = useMeetingNotesStore((state) => state.setMeetingNotesSize)

  const memoRef = React.useRef(null)
  React.useEffect(() => {
    setMemoRef(memoRef)
  }, [ setMemoRef, memoRef ])

  return (
    <Panel minSize={25} defaultSize={30} maxSize={75} collapsible={true} ref={memoRef} onResize={setMemoSize}>
      <div className={'bg-gray-200 h-full rounded'}>
        <SimpleBar className={'w-full h-full'} autoHide={true}>
          <MeetingNotesComponents />
        </SimpleBar>
      </div>
    </Panel>
  )
}

export default MeetingNotes