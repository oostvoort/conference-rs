import styled from '@emotion/styled'
import tw from 'twin.macro'
import { memo } from 'react'

export const RoomContainer = memo(
  styled.div(() => [
    tw`h-[100vh] w-[100vw] bg-primary2 bg-green-300`,
  ])
)
