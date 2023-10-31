import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"

import ClearIcon from "@mui/icons-material/Clear"

import { Principle } from "../types"
import PrincipleFilterButton from "./PrincipleFilterButton"

interface SkillFilterProps {
    principles: Principle[]
    selectedPrinciple: Principle | undefined
    handleSelectedPrinciple(principle: Principle | undefined): void
}

const PrincipleFilterBar = ({
    principles,
    selectedPrinciple,
    handleSelectedPrinciple,
}: SkillFilterProps) => {
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
