import { Suspense, useMemo } from "react"
import {
    Link,
    Navigate,
    PathMatch,
    Route,
    matchPath,
    useLocation,
} from "react-router-dom"
import SlideRoutes from "react-slide-routes"

import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import CssBaseline from "@mui/material/CssBaseline"
import Stack from "@mui/material/Stack"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Toolbar from "@mui/material/Toolbar"
import { amber } from "@mui/material/colors"
import {
    ThemeProvider,
    alpha,
    createTheme,
    responsiveFontSizes,
    styled,
} from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"

import ElevationScroll from "./ElevationScroll.tsx"
import { useDrawerContext } from "./components/Drawer.tsx"
import LoadingIndicator from "./components/LoadingIndicator.tsx"
import Aspects from "./routes/Aspects"
import AssistantView from "./routes/Assistant.tsx"
import Home from "./routes/Home"
import AllItemsView from "./routes/Items.tsx"
import Principles from "./routes/Principles.tsx"
import SkillsView from "./routes/Skills"
import WorkstationView from "./routes/Workstation.tsx"

const ROUTE_LINKS = [
    { label: "Home", href: "/", pattern: "/" },
    { label: "Aspects", href: "/aspects", pattern: "/aspects" },
    { label: "Principles", href: "/principles", pattern: "/principles" },
    { label: "Skills", href: "/skills", pattern: "/skills" },
    { label: "Items", href: "/items", pattern: "/items" },
    { label: "Assistance", href: "/assistance", pattern: "/assistance" },
    { label: "Workstations", href: "/workstations", pattern: "/workstations" },
]

function useRouteMatch(
    patterns: readonly string[],
): PathMatch<string> | undefined {
    const { pathname } = useLocation()

    for (const pattern of patterns) {
        const possibleMatch = matchPath(pattern, pathname)
        if (possibleMatch !== null) {
            return possibleMatch
        }
    }

    return undefined
}

const makeBaseTheme = (dark: boolean) => {
    const buttonStyle = { fontWeight: "bold" }
    return createTheme({
        palette: {
            mode: dark ? "dark" : "light",
            primary: amber,
        },
        typography: {
            button: buttonStyle,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    text: buttonStyle,
                    textPrimary: buttonStyle,
                },
            },
            MuiButtonBase: {
                styleOverrides: {
                    root: buttonStyle,
                },
            },
            MuiStack: {
                defaultProps: {
                    useFlexGap: true,
                },
            },
        },
    })
}

const App = () => {
    const dark = useMediaQuery("(prefers-color-scheme: dark)")
    const theme = useMemo(
        () => responsiveFontSizes(makeBaseTheme(dark)),
        [dark],
    )
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Stack
                direction="column"
                justifyContent="start"
                justifyItems="center"
                sx={{
                    "&>*": { flexShrink: 0 },
                    "&>.slide-routes": { flexGrow: 1 },
                }}
            >
                <AppNav />
                <Suspense fallback={<LoadingIndicator sx={{ m: "auto" }} />}>
                    <SlideRoutes>
                        <Route index element={<Home />} />
                        <Route path="aspects" element={<Aspects />} />
                        <Route path="principles" element={<Principles />} />
                        <Route path="skills" element={<SkillsView />} />
                        <Route path="items" element={<AllItemsView />} />
                        <Route path="assistance" element={<AssistantView />} />
                        <Route
                            path="workstations"
                            element={<WorkstationView />}
                        />
                        <Route path="*" element={<Navigate replace to="/" />} />
                    </SlideRoutes>
                </Suspense>
            </Stack>
        </ThemeProvider>
    )
}

interface AppBarProps extends MuiAppBarProps {
    open?: boolean
    drawerWidth: number
}

const AppBar = styled(MuiAppBar, {
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
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}))

function AppNav() {
    const { open, width } = useDrawerContext()
    const currentTab = useRouteMatch(ROUTE_LINKS.map(({ pattern }) => pattern))
        ?.pattern.path
    return (
        <ElevationScroll>
            <AppBar open={open} drawerWidth={width} position="sticky">
                <Toolbar component="nav" sx={{ justifyContent: "center" }}>
                    <Tabs centered value={currentTab}>
                        {ROUTE_LINKS.map(({ label, href, pattern }) => (
                            <Tab
                                key={label}
                                label={label}
                                value={pattern}
                                component={Link}
                                to={href}
                            />
                        ))}
                    </Tabs>
                </Toolbar>
            </AppBar>
        </ElevationScroll>
    )
}

export default App
