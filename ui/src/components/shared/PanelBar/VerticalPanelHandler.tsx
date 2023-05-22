import { PanelResizeHandle } from 'react-resizable-panels'

type PropType = {
    id?: string
}
export const VerticalPanelHandler = ({ id }: PropType) => {
    return (
        <PanelResizeHandle
            className={'mx-1 flex-[0_0_1em] relative outline-0 bg-transparent data-[resize-handle-active]:bg-[#ffffff33] transition-colors ease-out duration-500 rounded-[0.25em]'}
            id={id}
        >
            <div className={'absolute inset-[0] rounded-[0.25em] bg-transparent transition-colors'}>
                <svg className={`w-[1em] h-[1em] absolute inset-x-[0em] top-[50%] text-gray-400 rotate-90`} viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M8,18H11V15H2V13H22V15H13V18H16L12,22L8,18M12,2L8,6H11V9H2V11H22V9H13V6H16L12,2Z"
                    />
                </svg>
            </div>
        </PanelResizeHandle>
    )
}
