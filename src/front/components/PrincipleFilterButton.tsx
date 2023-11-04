import { useCallback } from "react"

import IconButton from "@mui/material/IconButton"

import { PrincipleIcon } from "../routes/Principles"
import { Principle } from "../types"

interface PrincipleFilterButtonProps {
    principle: Principle
    selectedPrinciple?: Principle | undefined
    onPrincipleFilter(principle: Principle): void
}

const PrincipleFilterButton = ({
    principle,
    selectedPrinciple,
    onPrincipleFilter,
}: PrincipleFilterButtonProps) => {
    const handlePrincipleFilter = useCallback(
        () => onPrincipleFilter?.(principle),
        [onPrincipleFilter, principle],
    )
    const principleMatch = principle.id === selectedPrinciple?.id
    const style = {
        backgroundColor: principleMatch ? "primary.main" : undefined,
    }
    const icon = <PrincipleIcon principle={principle.id} />
    return (
        <IconButton
            onClick={handlePrincipleFilter}
            sx={{ ...style, "&:hover": { ...style } }}
        >
            {icon}
        </IconButton>
    )
}

export default PrincipleFilterButton
