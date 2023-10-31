import { useCallback } from "react"

import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"

import { PrincipleIcon } from "../routes/Principles"
import { Principle } from "../types"

interface PrincipleFilterButtonProps {
    principle: Principle
    selectedPrinciple?: Principle | undefined
    count?: number | string | undefined
    onPrincipleFilter(principle: Principle): void
}

const PrincipleFilterButton = ({
    principle,
    selectedPrinciple,
    count,
    onPrincipleFilter,
}: PrincipleFilterButtonProps) => {
    const handlePrincipleFilter = useCallback(
        () => onPrincipleFilter(principle),
        [onPrincipleFilter, principle],
    )
    const principleMatch = principle.id === selectedPrinciple?.id
    const style = {
        backgroundColor: principleMatch ? "primary.main" : undefined,
    }
    const icon = <PrincipleIcon id={principle.id} />
    return count ? (
        <Button
            onClick={handlePrincipleFilter}
            startIcon={icon}
            variant={principleMatch ? "contained" : "outlined"}
        >
            {count}
        </Button>
    ) : (
        <IconButton
            onClick={handlePrincipleFilter}
            sx={{ ...style, "&:hover": { ...style } }}
        >
            {icon}
        </IconButton>
    )
}

export default PrincipleFilterButton
