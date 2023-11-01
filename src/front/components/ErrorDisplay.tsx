import Alert from "@mui/material/Alert"
import AlertTitle from "@mui/material/AlertTitle"
import Button from "@mui/material/Button"

export interface ErrorDisplayProps {
    error: Error
    resetErrorBoundary: () => void
}

export default function ErrorDisplay({
    error,
    resetErrorBoundary,
}: ErrorDisplayProps) {
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
