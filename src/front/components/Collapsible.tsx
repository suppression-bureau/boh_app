import { useCallback, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"

import Button from "@mui/material/Button"
import CardActions from "@mui/material/CardActions"
import Collapse from "@mui/material/Collapse"

import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"

import ErrorDisplay from "./ErrorDisplay"

interface CollapsibleProps {
    buttonShowHideText?: string
    cardHeader: React.ReactNode // provide a CardHeader component
    children: React.ReactNode
}

export const Collapsible = ({
    buttonShowHideText = "",
    cardHeader,
    children,
}: CollapsibleProps) => {
    const [expanded, setExpanded] = useState(false)
    const toggleExpanded = useCallback(
        () => setExpanded(!expanded),
        [expanded, setExpanded],
    )
    return (
        <>
            <CardActions>
                {cardHeader}
                <Button
                    onClick={toggleExpanded}
                    endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                    sx={{ ml: "auto" }}
                >
                    {expanded
                        ? `Hide ${buttonShowHideText}`
                        : `Show ${buttonShowHideText}`}
                </Button>
            </CardActions>
            <ErrorBoundary FallbackComponent={ErrorDisplay}>
                <Collapse
                    in={expanded}
                    timeout="auto"
                    mountOnEnter
                    unmountOnExit
                >
                    {children}
                </Collapse>
            </ErrorBoundary>
        </>
    )
}
