import { useState } from "react"

import CircularProgress from "@mui/material/CircularProgress"

export default function LoadingIndicator() {
    const [visible, setVisible] = useState(false)
    setTimeout(() => {
        setVisible(true)
    }, 500)
    return visible ? <CircularProgress /> : null
}
