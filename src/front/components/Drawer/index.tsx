import { RefObject, createContext, useContext, useRef, useState } from "react"

export interface DrawerContextProps {
    open: boolean
    setOpen(this: void, open: boolean): void
    width: number
    ref: RefObject<HTMLDivElement | null>
}

const DrawerContext = createContext<DrawerContextProps>({
    open: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setOpen() {},
    width: 245,
    // eslint-disable-next-line unicorn/no-null
    ref: { current: null },
})

export interface DrawerContextProviderProps {
    open?: boolean | undefined
    width?: number | undefined
    children?: React.ReactNode
}

export const DrawerContextProvider = ({
    width = 245,
    children,
}: DrawerContextProviderProps = {}) => {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    return (
        <DrawerContext.Provider value={{ open, setOpen, width, ref }}>
            {children}
        </DrawerContext.Provider>
    )
}

export function useDrawerContext(): DrawerContextProps {
    return useContext(DrawerContext)
}
