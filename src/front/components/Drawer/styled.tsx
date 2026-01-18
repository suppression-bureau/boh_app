import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import { Theme, styled } from "@mui/material/styles"

const makeLeaveTransition = (theme: Theme, props: string | string[]) =>
    theme.transitions.create(props, {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    })

const makeEnterTransition = (theme: Theme, props: string | string[]) =>
    theme.transitions.create(props, {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
    })

export interface AppBarProps extends MuiAppBarProps {
    open?: boolean
    drawerWidth: number
}

export const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerWidth",
})<AppBarProps>(({ theme, open = false, drawerWidth }) => ({
    transition: makeLeaveTransition(theme, ["margin", "width"]),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginInlineStart: `${drawerWidth}px`,
        transition: makeEnterTransition(theme, ["margin", "width"]),
    }),
}))

interface MainProps {
    open?: boolean
    drawerWidth: number
}

export const Main = styled(Box<"main">, {
    shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerWidth",
})<MainProps>(({ theme, open, drawerWidth }) => ({
    transition: makeLeaveTransition(theme, "margin"),
    marginInlineStart: `-${drawerWidth}px`,
    ...(open && {
        transition: makeEnterTransition(theme, "margin"),
        marginInlineStart: 0,
    }),
}))
