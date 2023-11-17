import { useCallback } from "react"

import IconButton from "@mui/material/IconButton"

import * as types from "../gql/graphql"
import { PrincipleIcon } from "./Icon"

interface PrincipleFilterButtonProps {
    principle: types.Principle
    selectedPrinciple?: types.Principle | undefined
    onPrincipleFilter(principle: types.Principle): void
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
    const principleMatch = principle === selectedPrinciple
    const style = {
        backgroundColor: principleMatch ? "primary.main" : undefined,
    }
    const icon = <PrincipleIcon principle={principle} />
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
