import { useMemo } from "react"
import { Link, Route, Navigate, useLocation, matchPath } from "react-router-dom"
import SlideRoutes from "react-slide-routes"

import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import CssBaseline from "@mui/material/CssBaseline"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Toolbar from "@mui/material/Toolbar"
import { amber } from "@mui/material/colors"
import {
    alpha,
    createTheme,
    responsiveFontSizes,
    ThemeProvider,
} from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"

import ElevationScroll from "./ElevationScroll.tsx"
import Home from "./routes/Home"
import Aspects from "./routes/Aspects"
import Principles from "./routes/Principles.tsx"
import SkillsView from "./routes/Skills"
import React from "react"

const ROUTE_LINKS = [
    { label: "Home", href: "/", pattern: "/" },
    { label: "Aspects", href: "/aspects", pattern: "/aspects" },
    { label: "Principles", href: "/principles", pattern: "/principles" },
    { label: "Skills", href: "/skills", pattern: "/skills" },
]

function useRouteMatch(patterns: readonly string[]) {
    const { pathname } = useLocation()

    for (const pattern of patterns) {
        const possibleMatch = matchPath(pattern, pathname)
        if (possibleMatch !== null) {
            return possibleMatch
        }
    }

    return null
}

const App = () => {
    const dark = useMediaQuery("(prefers-color-scheme: dark)")
    const theme = useMemo(() => {
        const baseTheme = createTheme({
            palette: {
                mode: dark ? "dark" : "light",
                primary: amber,
            },
        })
        return responsiveFontSizes(baseTheme)
    }, [dark])
    const currentTab = useRouteMatch(ROUTE_LINKS.map(({ pattern }) => pattern))
        ?.pattern.path
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ElevationScroll>
                <AppBar
                    position="sticky"
                    sx={{
                        color: theme.palette.text.primary,
                        background: alpha(
                            theme.palette.background.default,
                            0.7,
                        ),
                        // TODO re-add contrast(200%) before blur without discoloring dark mode
                        backdropFilter: "blur(15px)",
                    }}
                >
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
            <Box
                component="main"
                sx={{
                    maxWidth: "42rem",
                    mx: "auto",
                    p: 3,
                }}
            >
                <React.Suspense fallback={"Loading..."}>
                    <SlideRoutes>
                        <Route index element={<Home />} />
                        <Route path="aspects" element={<Aspects />} />
                        <Route path="principles" element={<Principles />} />
                        <Route path="skills" element={<SkillsView />} />
                        <Route path="*" element={<Navigate replace to="/" />} />
                    </SlideRoutes>
                </React.Suspense>
            </Box>
        </ThemeProvider>
    )
}

export default App
