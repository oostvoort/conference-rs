// @ts-ignore
import React, { memo } from 'react'
import styled from '@emotion/styled'
import tw from 'twin.macro'

interface Participants {
  totalParticipants: number,
  isShowMemo: boolean,
  isShareScreen: boolean
}



export const ParticipantsContainer = memo(
  styled.div(({totalParticipants, isShowMemo, isShareScreen} : Participants) => [
   !isShowMemo && [
     // Define default tailwind class
     tw`w-full flex justify-center gap-3`,

     // Define when the totalParticipants greater than 3
     totalParticipants >= 2 && tw`flex-wrap`,

     // Define gap when the square end from 3x3
     totalParticipants >= 7 && tw`gap-2`,

     // Define gap when the square end from 4x4
     totalParticipants >= 17 && tw`gap-1`,

     // Define gap when the square end from 5x5
     totalParticipants >= 26 && tw`gap-0.5`,
   ],

   (isShowMemo && !isShareScreen) && [
      tw`w-full flex flex-wrap justify-center items-center gap-1.5`
    ],

    (isShowMemo && isShareScreen) && [
      tw`w-full flex justify-start items-center gap-1.5`
    ]
  ])
)

export const VideoRenderContainer = memo(
  styled.div(() => [
    tw`relative`,
  ])
)

export const ParticipantName = memo(
  styled.p(() => [
    tw`absolute bottom-0 left-0 m-2 py-1 px-3 flex gap-3 bg-gray-400 rounded-2xl`
  ])
)
