import { memo } from 'react'
import styled from '@emotion/styled'
import tw from 'twin.macro'

interface ParticipantContainerPropTypes {
  isShowMemo: boolean,
  isShareScreen: boolean
}

export const MainContainer = memo(
  styled.div(() => [
    tw`h-full flex flex-col gap-3 p-3`
  ])
)

export const ParticipantContainer = memo(
  styled.div(({isShowMemo, isShareScreen} : ParticipantContainerPropTypes) => [
    tw`w-full h-full`,
    !isShowMemo && [
      tw`flex justify-center items-center`
    ],
    isShowMemo && [
      tw`flex flex-col-reverse justify-end items-center`
    ],
    isShareScreen && [
        tw`flex justify-start items-start`
    ],
    (isShareScreen && isShowMemo) && [
        tw`flex justify-end items-start`
    ]
  ])
)

export const VideoRenderContainer = memo(
  styled.div(() => [
    tw`w-full h-full p-1`
  ])
)

export const LeftContainer = memo(
  styled.div(({isShareScreen, isShowMemo, totalParticipants} : any) => [
      totalParticipants <= 2 && [
          tw`max-h-full`
      ],
      totalParticipants >= 3 && [
          tw`h-full`,
      ],
      !isShareScreen && [
          tw`w-full`
      ],
      (isShareScreen && !isShowMemo) && [
          tw`w-[20%]`
      ],
      (isShareScreen && isShowMemo) && [
          tw`w-[25vw]`
      ],
  ])
)

export const RightContainer = memo(
  styled.div(() => [
    tw`w-full max-h-full`
  ])
)
