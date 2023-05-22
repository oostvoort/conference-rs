import { memo } from 'react'
import styled from '@emotion/styled'
import tw from 'twin.macro'

interface Participants {
  totalParticipants: number,
  isShareScreen: boolean,
  isShowMemo: boolean
}

export const VideoComp = memo(
  styled.video(({totalParticipants, isShareScreen, isShowMemo} : Participants) => [
    // Define default tailwind class
    tw`bg-primary3 rounded-xl`,

    !isShareScreen && [
      // Define when the totalParticipants equal to 1
      totalParticipants == 1 && tw`w-full h-full`,

      // Define when the totalParticipants equal to 2
      totalParticipants == 2 && tw`w-[48vw] h-auto`,

      // Define when the totalParticipants greater than 3
      totalParticipants >= 3 && tw`h-auto`,
      (totalParticipants >= 3 && totalParticipants <= 4) && tw`w-[45vw]`,

      // Define Basic equation here and manipulate tailwindcss
      (totalParticipants >= 5 && totalParticipants <= 6) && tw`w-[32vw]`,

      // Define width when the square end from 3x3
      (totalParticipants >= 7) && tw`w-[24vw]`,

      // Define width when the square end from 4x4
      (totalParticipants >= 17) && tw`w-[18vw]`,

      // Define width when the square end from 5x5
      (totalParticipants >= 26) && tw`w-[14vw]`
    ],

    (isShowMemo && isShareScreen) && [
       tw`w-[30vw] h-[20vh]`,
    ],
  ])
)

export const VoiceComp = memo(
    styled.div(({totalParticipant, screenSizeObserver, isShareScreen, isShowMemo} : any) => [
        tw`bg-primary3 rounded-xl`,

        !isShareScreen && [
            screenSizeObserver >= 400 && tw`w-[23vw] h-[34vh]`,
            screenSizeObserver >= 500 && tw`w-[30vw] h-[40vh]`,
            screenSizeObserver >= 600 && tw`w-[37vw] h-[50vh]`,
            screenSizeObserver >= 700 && tw`w-[40vw] h-[60vh]`,

            totalParticipant == 1 && [
                screenSizeObserver >= 800 && tw`w-[50vw] h-[65vh]`,
                screenSizeObserver >= 1000 && tw`w-[56vw] h-[70vh]`,
                screenSizeObserver >= 1100 && tw`w-[60vw] h-[75vh]`,
                screenSizeObserver >= 1300 && tw`w-[65vw] h-[80vh]`,
                screenSizeObserver >= 1500 && tw`w-[80vw] h-[80vh]`,
            ],

            totalParticipant == 2 && [
                screenSizeObserver >= 1300 && tw`w-[35vw] h-[30vw]`,
                screenSizeObserver >= 1500 && tw`w-[45vw] h-[30vw]`,
            ],

            totalParticipant >= 3 && [
                screenSizeObserver >= 1300 && tw`w-[34vw] h-[21vw]`,
                screenSizeObserver >= 1500 && tw`w-[34vw] h-[21vw]`,
            ],

            totalParticipant >= 5 && [
                screenSizeObserver >= 800 && tw`w-[25vw] h-[45vh]`,
                screenSizeObserver >= 1000 && tw`w-[20vw] h-[30vh]`,
                screenSizeObserver >= 1100 && tw`w-[25vw] h-[35vh]`,
                screenSizeObserver >= 1300 && tw`w-[28vw] h-[33vh]`,
                screenSizeObserver >= 1500 && tw`w-[25vw] h-[40vh]`,
            ],

            totalParticipant >= 10 && [
                screenSizeObserver >= 1100 && tw`w-[23vw] h-[33vh]`,
                screenSizeObserver >= 1300 && tw`w-[25vw] h-[30vh]`,
                screenSizeObserver >= 1500 && tw`w-[15vw] h-[30vh]`,
            ],

            totalParticipant >= 19 && [
                screenSizeObserver >= 1100 && tw`w-[18vw] h-[28vh]`,
                screenSizeObserver >= 1300 && tw`w-[20vw] h-[25vh]`,
                screenSizeObserver >= 1500 && tw`w-[10vw] h-[20vh]`,
            ],
        ],

        isShareScreen && [
            tw`w-[18vw] h-[28vh]`,
        ],

        (isShareScreen && isShowMemo) && [
            tw`w-[8vw] h-[13vh]`,
        ]
    ])
)

export const ImageVoiceComp = memo(
    styled.img(() => [
        tw`w-[50%] h-[50%]`
    ])
)