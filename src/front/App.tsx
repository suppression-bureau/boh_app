import { useMemo } from "react"
import CssBaseline from "@mui/material/CssBaseline"
import { amber } from "@mui/material/colors"
import useMediaQuery from "@mui/material/useMediaQuery"
import {
    createTheme,
    responsiveFontSizes,
    ThemeProvider,
} from "@mui/material/styles"

import Aspects from "./routes/Aspects"

// TODO: routing
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
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Aspects />
        </ThemeProvider>
    )
}

export default App
