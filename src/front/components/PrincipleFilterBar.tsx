import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"

import ClearIcon from "@mui/icons-material/Clear"

import { PRINCIPLES, Principle } from "../types"
import PrincipleFilterButton from "./PrincipleFilterButton"

interface PrincipleFilterProps {
    selectedPrinciple: Principle | undefined
    handleSelectedPrinciple(principle: Principle | undefined): void
}

const PrincipleFilterBar = ({
    selectedPrinciple,
    handleSelectedPrinciple,
}: PrincipleFilterProps) => {
    const principles = PRINCIPLES.map((principle) => ({
        id: principle,
    }))
    return (
        <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
            {principles.map((principle) => (
                <PrincipleFilterButton
                    key={principle.id}
                    principle={principle}
                    selectedPrinciple={selectedPrinciple}
                    onPrincipleFilter={handleSelectedPrinciple}
                />
            ))}
            <IconButton
                size="large"
                onClick={() => handleSelectedPrinciple(undefined)}
            >
                <ClearIcon />
            </IconButton>
        </Stack>
    )
}
export default PrincipleFilterBar
