import Stack from "@mui/material/Stack"

import * as types from "../gql/graphql"
import PrincipleFilterButton from "./PrincipleFilterButton"

type Principle = Pick<types.Principle, "id">
interface SkillFilterProps {
    principles: Principle[]
    selectedPrinciple: Principle | undefined
    handleSelectedPrinciple(principle: Principle): void
}

const PrincipleFilterBar = ({
    principles,
    selectedPrinciple,
    handleSelectedPrinciple,
}: SkillFilterProps) => {
    return (
        <Stack direction={"row"} spacing={2} useFlexGap flexWrap={"wrap"}>
            {principles.map((principle) => (
                <PrincipleFilterButton
                    key={principle.id}
                    principle={principle}
                    selectedPrinciple={selectedPrinciple}
                    onPrincipleFilter={handleSelectedPrinciple}
                />
            ))}
        </Stack>
    )
}
export default PrincipleFilterBar
