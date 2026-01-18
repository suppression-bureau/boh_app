import Alert from "@mui/material/Alert"
import AlertTitle from "@mui/material/AlertTitle"
import Button from "@mui/material/Button"

export interface ErrorDisplayProps {
    error: unknown
    resetErrorBoundary: () => void
}

export default function ErrorDisplay({
    error: e,
    resetErrorBoundary,
}: ErrorDisplayProps) {
    const error = e instanceof Error ? e : new Error(String(e))
    return (
        <Alert
            severity="error"
            action={
                <Button onClick={resetErrorBoundary}>Try&nbsp;again</Button>
            }
        >
            <AlertTitle>{error.message}</AlertTitle>
            {error.stack && <pre>{error.stack}</pre>}
        </Alert>
    )
}
