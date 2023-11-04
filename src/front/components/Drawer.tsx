import { createContext, useContext, useState } from "react"

export interface DrawerContextProps {
    open: boolean
    setOpen(this: void, open: boolean): void
    width: number
}

const DrawerContext = createContext<DrawerContextProps>({
    open: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setOpen() {},
    width: 245,
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
    return (
        <DrawerContext.Provider value={{ open, setOpen, width }}>
            {children}
        </DrawerContext.Provider>
    )
}

export function useDrawerContext(): DrawerContextProps {
    return useContext(DrawerContext)
}
