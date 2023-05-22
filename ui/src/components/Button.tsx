// @ts-ignore
import React from 'react'

export const Button = ({ imageProps, onClick, buttonClass }: any) => {
    const { src, alt, width, height } = imageProps
    return (
        <>
            <button type={'button'} className={`${buttonClass} hover:bg-gray-500 hover:rounded rounded transition ease-out duration-500`} onClick={onClick}>
                <img src={src} alt={alt} width={width} height={height} className={'my-auto'} />
            </button>
        </>
    )
}
