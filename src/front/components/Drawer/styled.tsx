import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import { alpha, styled } from "@mui/material/styles"

export interface AppBarProps extends MuiAppBarProps {
    open?: boolean
    drawerWidth: number
}

export const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerWidth",
})<AppBarProps>(({ theme, open = false, drawerWidth }) => ({
    color: theme.palette.text.primary,
    background: alpha(theme.palette.background.default, 0.7),
    // TODO re-add contrast(200%) before blur without discoloring dark mode
    backdropFilter: "blur(15px)",
    // Drawer stuff
    transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginInlineStart: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}))

interface MainProps {
    open?: boolean
    drawerWidth: number
}

export const Main = styled("main", {
    shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerWidth",
})<MainProps>(({ theme, open, drawerWidth }) => ({
    flexGrow: 1,
    paddingBlockEnd: theme.spacing(3),
    transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginInlineStart: `-${drawerWidth}px`,
    ...(open && {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginInlineStart: 0,
    }),
}))
