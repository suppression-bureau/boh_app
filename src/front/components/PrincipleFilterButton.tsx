import Button from "@mui/material/Button"

import * as types from "../gql/graphql"
import { PrincipleIcon } from "../routes/Principles"

type Principle = Pick<types.Principle, "id">

interface PrincipleFilterButtonProps {
    principle: Principle
    selectedPrinciple: Principle | undefined
    count: number
    handlePrincipleFilter(principle: Principle): void
}

const PrincipleFilterButton = ({
    principle,
    selectedPrinciple,
    count,
    handlePrincipleFilter,
}: PrincipleFilterButtonProps) => (
    <Button
        key={principle.id}
        startIcon={<PrincipleIcon id={principle.id} />}
        onClick={() => handlePrincipleFilter(principle)}
        variant={
            selectedPrinciple?.id === principle.id ? "contained" : "outlined"
        }
    >
        {count}
    </Button>
)

export default PrincipleFilterButton
