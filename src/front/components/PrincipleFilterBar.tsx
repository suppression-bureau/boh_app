import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"

import ClearIcon from "@mui/icons-material/Clear"

import { PRINCIPLES, Principle } from "../types"
import PrincipleFilterButton from "./PrincipleFilterButton"

interface PrincipleFilterProps {
    selectedPrinciple: Principle | undefined
    onSelectPrinciple(principle?: Principle | undefined): void
}

const PrincipleFilterBar = ({
    selectedPrinciple,
    onSelectPrinciple,
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
                    onPrincipleFilter={onSelectPrinciple}
                />
            ))}
            <IconButton size="large" onClick={() => onSelectPrinciple()}>
                <ClearIcon />
            </IconButton>
        </Stack>
    )
}
export default PrincipleFilterBar
