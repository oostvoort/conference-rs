import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { RefObject } from 'react'

interface MeetingNotesState {
  meetingNotesRef: RefObject<HTMLDivElement> | null,
  setMeetingNotesRef: (value: RefObject<HTMLDivElement> | null) => void
  meetingNotesSize: number,
  setMeetingNotesSize: (value: number) => void
}

const useMeetingNotesStore = create<MeetingNotesState>() (
  persist(
    (set) => ({
      meetingNotesRef: null,
      setMeetingNotesRef: (ref) => set({ meetingNotesRef: ref }),

      meetingNotesSize: 0,
      setMeetingNotesSize: (value: number) => set({ meetingNotesSize: value }),
    }),
    {
      name: 'MEMO_CONFIG',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default useMeetingNotesStore
