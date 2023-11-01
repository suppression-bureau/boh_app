import { useState } from "react"

import CircularProgress, {
    CircularProgressProps,
} from "@mui/material/CircularProgress"

export interface LoadingIndicatorProps extends CircularProgressProps {
    delayMs?: number
}

export default function LoadingIndicator({
    delayMs = 500,
    ...props
}: LoadingIndicatorProps) {
    const [visible, setVisible] = useState(false)
    setTimeout(() => setVisible(true), delayMs)
    return visible ? <CircularProgress {...props} /> : null
}
